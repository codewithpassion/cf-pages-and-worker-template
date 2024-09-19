import { EmailSender } from "./email/sender"
export type HonoAppType = {
  Bindings: {
    HEIMDALL_BUCKET: R2Bucket
  },
  Env: {
    JWT_SECRET: string
    OTP_SECRET: string
    RESEND_API_KEY: string,
    RESEND_FROM_EMAIL: string,
  },
  Variables: {
    jwtSecret: string,
    otpSecret: string,
    emailSender: EmailSender,
    jwtPayload: {
      sub: string
      role: string
    }
  }
}


export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  refreshToken?: string;
  currentlyAuthenticating?: boolean;
  isActivated: boolean;
  createdAt: string;
  updatedAt: string;

}

export type Project = {
  id: string;
  name: string;
  description: string;
  admins: User[];
  members: User[];
}
