import { Context, Hono } from "hono";
import { HonoAppType, User } from "./types";
import { decode, sign, verify } from "hono/jwt";
import { totp } from "otplib";
import { UsersRepo } from "./repo/Users";

const app = new Hono<HonoAppType>();


// Login endpoint
app.post('/login', async (c) => {
  const { email } = await c.req.json()
  const usersRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
  const user = await usersRepo.findByEamil(email)
  if (!user) return c.json({ message: 'User not found' }, 404)

  // Generate a TOTP token
  const token = totp.generate(user.email + c.get('otpSecret'));
  console.log('Generated token', token)

  user.currentlyAuthenticating = true;
  if (!(await usersRepo.update(user.email, user))) {
    return c.json({ message: 'Failed to update user' }, 500)
  }

  const emailSender = c.get('emailSender');
  const emailRes = await emailSender.sendOtp({ otp: token, email: user.email });
  if (!emailRes || emailRes.error) {
    console.error('Failed to send OTP', emailRes)
    return c.json({ message: 'Failed to send OTP' }, 500)
  }

  return c.json({ ok: true, emailRes })
})


app.post('/otp', async (c) => {
  const { email, otp } = await c.req.json()
  const usersRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
  const user = await usersRepo.read(email)
  if (!user) return c.json({ message: 'User not found' }, 404)

  if (!user.currentlyAuthenticating) {
    return c.json({ message: 'Invalid call' }, 400)
  }

  console.log("Checking", otp, user.email + c.get('otpSecret'))
  const isValid = totp.check(otp, user.email + c.get('otpSecret'));
  if (!isValid) return c.json({ message: 'Invalid OTP' }, 400)

  const accessToken = await getAccessToken(user, c);
  const refreshToken = await setupRefreshToken(user, c, usersRepo);

  user.currentlyAuthenticating = false;
  await usersRepo.update(user.email, user)

  return c.json({ accessToken, refreshToken })
})

app.post('/verify', async (c) => {
  const accessToken = c.req.header('X-Access-Token')
  if (!accessToken) {
    return c.json({ error: 'Access token is required' }, 400)
  }

  try {
    const payload = await verify(accessToken, c.get('jwtSecret'))
    if ((payload as any).type !== 'access') {
      return c.json({ error: 'Invalid token type' }, 400)
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
      return c.json({ error: 'Invalid token type' }, 400)
    }

    const userRepo = new UsersRepo(c.env.HEIMDALL_BUCKET)
    const user = await userRepo.read((payload as any).sub)
    if (!user) return c.json({ message: 'User not found' }, 404)
    if (!user.refreshToken) return c.json({ error: 'Invalid refresh token' }, 400)
    if (user.refreshToken !== refreshToken) return c.json({ error: 'Invalid refresh token' }, 400)

    const newAccessToken = await sign(getRefreshTokenPayload(user), c.get('jwtSecret'))
    const newRefreshToken = await setupRefreshToken(user, c, userRepo);

    return c.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch (error) {
    return c.json({ error: 'Invalid refresh token' }, 401)
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