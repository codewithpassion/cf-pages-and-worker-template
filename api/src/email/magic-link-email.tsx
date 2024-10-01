import React from "react";
import { Html, Button } from "@react-email/components";

export type EmailProps = {
  link: string;
  description: string;
};

const MagicLinkEmail: React.FC<EmailProps> = ({
  link,
  description,
}: EmailProps) => {
  return (
    <Html lang="en">
      <p>
        <h2>Please click below to login to {description}:</h2>
        <Button href={link} style={{ color: "#61dafb", padding: "10px 20px" }}>
          Click me
        </Button>
      </p>
      <p>Or copy this link to your browser: {link}</p>
    </Html>
  );
};

export { MagicLinkEmail };
