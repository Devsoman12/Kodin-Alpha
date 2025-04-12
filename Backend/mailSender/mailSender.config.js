import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

export const client = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.TOKEN,
});

export const sender = {
  email: "blasenblich@demomailtrap.com", // Your sender email address
  name: "BLASENBLICH",
};

