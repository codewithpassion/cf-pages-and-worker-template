import { Context, Hono } from "hono";
import { HonoAppType, User } from "./types";
import { decode, sign, verify } from "hono/jwt";
import { authenticator, totp } from "otplib";
import { UsersRepo } from "./repo/Users";

const app = new Hono<HonoAppType>();


// Login endpoint
app.post('/login', async (c) => {
  const { email } = await c.req.json()
  const usersRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
  const user = await usersRepo.findByEamil(email)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  // Generate a TOTP token
  const secret = authenticator.generateSecret();
  const token = totp.generate(`${user.email} - ${secret} - ${c.get('otpSecret')}`);
  console.log("Token", token)

  user.secret = secret;
  user.currentlyAuthenticating = true;

  if (!(await usersRepo.update(user.email, user))) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const emailSender = c.get('emailSender');
  const emailRes = await emailSender.sendOtp({ otp: token, email: user.email });
  if (!emailRes || emailRes.error) {
    console.error('Failed to send OTP', emailRes)
    return c.json({ message: 'Failed to send OTP' }, 500)
  }

  return c.json({ ok: true, emailRes })
})

app.post('/logout', async (c) => {
  const accessToken = c.req.header('X-Access-Token')
  if (!accessToken) {
    return c.json({ error: 'Access token is required' }, 400)
  }

  try {
    const payload = await verify(accessToken, c.get('jwtSecret'))
    if ((payload as any).type !== 'access') {
      console.log("Invalid token type", payload)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const repo = new UsersRepo(c.env.HEIMDALL_BUCKET)
    const user = await repo.read((payload as any).sub)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    user.refreshToken = undefined;
    const res = repo.update(user.email, user)
    if (!res) {
      console.log("Failed to update user", user, res)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    return c.json({ ok: true })

  } catch (error) {
    console.error("Unauthorized", error)
    return c.json({ error: 'Unauthorized' }, 401)
  }

});


app.post('/otp', async (c) => {
  const { email, otp } = await c.req.json()
  const usersRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
  const user = await usersRepo.read(email)
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
    const user = await userRepo.read((payload as any).sub)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    if (!user.refreshToken) return c.json({ error: 'Unauthorized' }, 401)
    if (user.refreshToken !== refreshToken) {
      console.log("Invalid refresh token", user.refreshToken, refreshToken)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const newAccessToken = await sign(getRefreshTokenPayload(user), c.get('jwtSecret'))
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
  return await sign(payload, c.get('jwtSecret'))
}

async function getRefreshToken(user: User, c: Context<HonoAppType>, usersRepo: UsersRepo) {
  const refreshToken = await sign(
    getRefreshTokenPayload(user),
    c.get('jwtSecret')
  )
  return refreshToken;
}

async function setupRefreshToken(user: User, c: Context<HonoAppType>, usersRepo: UsersRepo) {
  const refreshToken = await getRefreshToken(user, c, usersRepo)
  user.refreshToken = refreshToken;
  const res = await usersRepo.update(user.email, user)
  if (!res) {
    console.error('Failed to update user with refresh token')
    return null;
  }
  return refreshToken;
}

export default app;