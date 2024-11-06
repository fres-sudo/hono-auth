import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { injectable } from "tsyringe";
import nodemailer from "nodemailer";

type SendMail = {
  to: string | string[];
  subject: string;
  html: string;
};

type SendTemplate<T> = {
  to: string | string[];
  props: T;
};

@injectable()
export class MailerService {
  private nodemailer = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "adella.hoppe@ethereal.email",
      pass: "dshNQZYhATsdJ3ENke",
    },
  });

  sendEmailVerificationToken(data: SendTemplate<{ link: string }>) {
    const template = handlebars.compile(this.getTemplate("email-verification"));
    return this.send({
      to: data.to,
      subject: "Email Verification",
      html: template({ link: data.props.link }),
    });
  }

  sendResetPasswordOTP(data: SendTemplate<{ otp: string }>) {
    const template = handlebars.compile(this.getTemplate("reset-password"));
    return this.send({
      to: data.to,
      subject: "Password Reset",
      html: template({ code: data.props.otp }),
    });
  }

  private async send({ to, subject, html }: SendMail) {
    const message = await this.nodemailer.sendMail({
      from: '"Example" <example@ethereal.email>', // sender address
      bcc: to,
      subject, // Subject line
      text: html,
      html,
    });
  }

  private getTemplate(template: string) {
    const __dirname = path.dirname(__filename); // get the name of the directory
    return fs.readFileSync(
      path.join(__dirname, `../infrastructure/email-templates/${template}.hbs`),
      "utf-8",
    );
  }
}
