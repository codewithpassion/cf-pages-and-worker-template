import { Context, Hono } from "hono";
import { HonoAppType, User } from "./types";
import { decode, sign, verify } from "hono/jwt";
import { authenticator, totp } from "otplib";
import { UsersRepo } from "./repo/Users";
import { Projects } from "./repo/Projects";
import { nanoid } from "nanoid";
import { MagicLinksRepo } from "./repo/MagicLinks";

const app = new Hono<HonoAppType>();


// Login endpoint
app.post('/login', async (c) => {
  const body = await c.req.json()
  let { email, project, redirectTo, otp } = body as { email?: string, project?: string, redirectTo?: string, otp?: boolean };
  const unauthorized = c.json({ error: 'Unauthorized' }, 401);
  if (!project) project = 'auth'

  if (!email || !project) {
    console.log("Email and project are required, body", body)
    return unauthorized;
  }

  const usersRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
  const projectRepo = new Projects(c.env.HEIMDALL_BUCKET)
  const user = await usersRepo.findByEamil(email)
  const _project = await projectRepo.getByKey(project);
  if (!user || !_project) {
    console.log("User or project not found", email, project, body)
    return unauthorized;
  }
  if (_project.admins.indexOf(user.email) === -1 && _project.members.indexOf(user.email) === -1) {
    console.log("User is not a member or admin of the project", user, _project)
    return unauthorized;
  }

  if (otp) {
    if (!_project.authOptions.includes('otp')) {
      console.log("OTP is not enabled for this project", _project)
      return unauthorized;
    }
    // Generate a TOTP token
    const secret = authenticator.generateSecret();
    const token = totp.generate(`${user.email} - ${secret} - ${c.get('otpSecret')}`);
    console.log("Token", token)

    user.secret = secret;
    user.currentlyAuthenticating = true;

    if (!(await usersRepo.update(user.email, user))) {
      return unauthorized;
    }

    const emailSender = c.get('emailSender');
    const emailRes = await emailSender.sendOtp({ otp: token, email: user.email });
    if (!emailRes || emailRes.error) {
      console.error('Failed to send OTP', emailRes)
      return c.json({ message: 'Failed to send OTP' }, 500)
    }

    return c.json({ ok: true, emailRes })
  } else {
    if (!_project.authOptions.includes('magic-link')) {
      console.log("Magic link is not enabled for this project", _project)
      return unauthorized;
    }

    if (_project.magicLinkValiditySeconds < 1) {
      console.log("Magic link validity is less than 1", _project)
      return unauthorized;
    }
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + _project.magicLinkValiditySeconds * 1000);
    const magicLinkRepo = new MagicLinksRepo(c.env.HEIMDALL_BUCKET)
    magicLinkRepo.create({ token, email: user.email, expiresAt });

    const redirectUrl = `${redirectTo ? redirectTo : _project.redirectUrl}?token=${token}`;
    const emailSender = c.get('emailSender');
    const emailRes = await emailSender.sendMagicLink({ link: redirectUrl, email: user.email, description: `${_project.name}` });

    if (!emailRes || emailRes.error) {
      console.error('Failed to send magic link', emailRes)
      return c.json({ message: 'Failed to send magic link' }, 500)
    }

    return c.json({ ok: true, emailRes })

  }
})

app.post('/logout', async (c) => {
  const accessToken = c.req.header('X-Access-Token')
  const unauthorized = c.json({ error: 'Unauthorized' }, 401);

  if (!accessToken) {
    return c.json({ error: 'Access token is required' }, 400)
  }

  try {
    const payload = await verify(accessToken, c.get('jwtSecret'))
    if ((payload as any).type !== 'access') {
      console.log("Invalid token type", payload)
      return unauthorized
    }

    const repo = new UsersRepo(c.env.HEIMDALL_BUCKET)
    const user = await repo.getByKey((payload as any).sub)
    if (!user) return unauthorized

    user.refreshToken = undefined;
    const res = repo.update(user.email, user)
    if (!res) {
      console.log("Failed to update user", user, res)
      return unauthorized
    }

    return c.json({ ok: true })

  } catch (error) {
    console.error("Unauthorized", error)
    return unauthorized;
  }

});

app.post('/magic', async (c) => {
  const { token } = await c.req.json()
  const unauthorized = c.json({ error: 'Unauthorized' }, 401);

  if (!token) {
    return c.json({ error: 'Token is required' }, 400)
  }

  try {

    const magicLinksRepo = new MagicLinksRepo(c.env.HEIMDALL_BUCKET)
    const magicLink = await magicLinksRepo.getByKey(token)
    if (!magicLink) return unauthorized;

    const repo = new UsersRepo(c.env.HEIMDALL_BUCKET)
    const user = await repo.getByKey(magicLink.email)
    if (!user) return unauthorized

    const accessToken = await getAccessToken(user, c);
    const refreshToken = await setupRefreshToken(user, c, repo);
    await magicLinksRepo.delete(token)

    return c.json({ accessToken, refreshToken })

  } catch (error) {
    console.error("Unauthorized", error)
    return unauthorized;
  }
})

app.post('/otp', async (c) => {
  const { email, otp } = await c.req.json()
  const usersRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
  const user = await usersRepo.getByKey(email)
  if (!user) return c.json({ message: 'Unauthorized' }, 401)

  if (!user.currentlyAuthenticating) {
    console.log("User is not currently authenticating")
    return c.json({ message: 'Unauthorized' }, 401)
  }


  const fullSecret = `${user.email} - ${user.secret} - ${c.get('otpSecret')}`
  console.log("Checking", otp, fullSecret)
  const isValid = totp.check(otp, fullSecret);
  if (!isValid) return c.json({ message: 'Unauthorized' }, 401)

  const accessToken = await getAccessToken(user, c);
  const refreshToken = await setupRefreshToken(user, c, usersRepo);

  user.currentlyAuthenticating = false;
  await usersRepo.update(user.email, user)

  return c.json({ accessToken, refreshToken })
})

app.post('/verify', async (c) => {
  const accessToken = c.req.header('X-Access-Token')
  if (!accessToken) {
    return c.json({ error: 'Access token is required' }, 401)
  }

  try {
    const payload = await verify(accessToken, c.get('jwtSecret'))
    if ((payload as any).type !== 'access') {
      return c.json({ error: 'Invalid token type' }, 401)
    }

    const newAccessToken = await getAccessToken(payload as any, c)

    return c.json({ ok: true, payload, accessToken: newAccessToken })
  } catch (error) {
    console.error('Error', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
})

app.post('/refresh', async (c) => {
  const refreshToken = c.req.header('X-Refresh-Token')

  if (!refreshToken) {
    return c.json({ error: 'Refresh token is required' }, 400)
  }

  try {
    const payload = await verify(refreshToken, c.get('jwtSecret'))

    if (payload.type !== 'refresh') {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
    const user = await userRepo.getByKey((payload as any).sub)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    if (!user.refreshToken) return c.json({ error: 'Unauthorized' }, 401)
    if (user.refreshToken !== refreshToken) {
      console.log("Invalid refresh token", user.refreshToken, refreshToken)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // const newAccessToken = await sign(getRefreshTokenPayload(user), c.get('jwtSecret'))
    const newAccessToken = await getAccessToken(user, c);
    const newRefreshToken = await setupRefreshToken(user, c, userRepo);

    return c.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

function getRefreshTokenPayload(user: User) {
  return {
    sub: user.email,
    role: user.role,
    type: 'refresh',
    exp: Math.floor(Date.now()) + 60 * 60 * 24 * 7 // 7 days
  }
}

async function getAccessToken(user: User, c: Context<HonoAppType>) {
  const payload = {
    sub: user.email,
    role: user.role,
    type: 'access',
    exp: Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes
  }
  const token = await sign(payload, c.get('jwtSecret'))
  return { token, validTo: payload.exp * 1000, role: user.role }
}

async function getRefreshToken(user: User, c: Context<HonoAppType>, usersRepo: UsersRepo) {
  const refreshTokenPayload = getRefreshTokenPayload(user);

  const refreshToken = await sign(
    refreshTokenPayload,
    c.get('jwtSecret')
  )
  return { token: refreshToken, validTo: refreshTokenPayload.exp * 1000 };
}

async function setupRefreshToken(user: User, c: Context<HonoAppType>, usersRepo: UsersRepo) {
  const refreshToken = await getRefreshToken(user, c, usersRepo)
  user.refreshToken = refreshToken.token;
  const res = await usersRepo.update(user.email, user)
  if (!res) {
    console.error('Failed to update user with refresh token')
    return null;
  }
  return refreshToken;
}

export default app;