import React from "react";
import { Resend } from "resend";
import { OtpEmail } from "./otp-email";

type ResendOptions = {
  apiKey: string;
  from: string;
  to: string;
};

export class EmailSender {
  constructor(private resendOptions: ResendOptions) {}

  async sendOtp({ otp, email }: { otp: string; email: string }) {
    const resend = new Resend(this.resendOptions.apiKey);
    const emailData = { otp, email };
    const { data, error } = await resend.emails.send({
      from: this.resendOptions.from,
      to: email,
      subject: "One Time Password - " + otp,
      react: <OtpEmail {...emailData} />,
    });
    return { data, error };
  }
}
