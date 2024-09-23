import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { EmailSender } from "./email/sender";

const jwtMiddleware = createMiddleware(async (c, next) => {
    return jwt({
        secret: c.env.JWT_SECRET,
    })(c, async () => {
        console.log("jwtPayload", c.var.jwtPayload)
        if (c.var.jwtPayload?.type !== 'access') {
            console.log("User tried to access with the wrong token")
            throw new HTTPException(401, { message: 'Unauthorized' })
        }
        await next()
    })
});


const secretsMiddleware = createMiddleware(async (c, next) => {
    c.set('jwtSecret', c.env.JWT_SECRET);
    c.set('otpSecret', c.env.OTP_SECRET);
    await next();
})

const emailSenderMiddleware = createMiddleware(async (c, next) => {
    c.set('emailSender', new EmailSender({
        apiKey: c.env.RESEND_API_KEY,
        from: c.env.RESEND_FROM_EMAIL,
        to: c.env.RESEND_TO_EMAIL,
    }))
    await next();
})



export { jwtMiddleware, secretsMiddleware, emailSenderMiddleware }