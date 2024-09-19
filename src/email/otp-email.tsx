import React from "react";
import { Html } from "@react-email/components";

export type EmailProps = {
  otp: string;
};

const OtpEmail: React.FC<EmailProps> = ({ otp }: EmailProps) => {
  return (
    <Html lang="en">
      <p>
        <h2>Your One-Time-Password:</h2>
        <h1>{otp}</h1>
      </p>
      <p>
        <b>It is valid for 5 minutes</b>
      </p>
    </Html>
  );
};

export { OtpEmail };
