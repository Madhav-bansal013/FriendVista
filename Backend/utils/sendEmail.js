import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { hashedString } from "./index.js";
import Verification from "../models/emailVerification.js";
import PasswordReset from "../models/passwordReset.js";

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;
//smtp-mail.outlook.com
let transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
}); //transporter function used to send email configuring nodemailer

export const sendVerificationEmail = async (user, res) => {
  const { _id, email, firstName } = user;

  const token = _id + uuidv4();

  const link = APP_URL + "/users/verify/" + _id + "/" + token;

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<div 
    style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
    <h3 style="color: rgb(255, 105, 180)">Please verify your email address</h3>
    <hr>
    <h4 style="color: rgb(255, 105, 180)">Hi ${firstName},</h4>
    <p>
        Please verify your email address so we can know that it's really you.
        <br>
    <p>This link <b style="color: rgb(255, 105, 180)">expires in 10 minutes</b></p>
    <br>
    <a href=${link}
        style="color: #fff; padding: 14px; text-decoration: none; background-color:rgb(255, 105, 180);  border-radius: 8px; font-size: 18px;">Verify
        Email Address</a>
    </p>
    <div style="color: rgb(255, 105, 180) ; margin-top: 20px;">
        <h5>Best Regards</h5>
        <h5>FriendVista Team</h5>
    </div>
</div>`, //content to send in email
  };

  try {
    const hashedToken = await hashedString(token);

    const newVerifiedEmail = await Verification.create({
      userId: _id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000, //10 min in millisec
    });

    if (newVerifiedEmail) {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "Pending",
            message: "Email has been sent check mail for verification!",
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(404).json({ message: "Something went wrong" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};

export const resetPasswordLink = async (user, res) => {
  const { _id, email } = user;

  const token = _id + uuidv4();
  const link = APP_URL + "/users/reset-password/" + _id + "/" + token;

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Password Reset",
    html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
         Password reset link. Please click the link below to reset password.
        <br>
        <p style="font-size: 18px;color: rgb(255, 105, 180)"><b>This link expires in 10 minutes</b></p>
         <br>
        <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; background-color: rgb(255, 105, 180);  border-radius: 8px; font-size: 18px; ">Reset Password</a>.
    </p>`,
  };

  try {
    const hashedToken = await hashedString(token);
    const resetEmail = await PasswordReset.create({
      userId: _id,
      email: email,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000,
    });

    if (resetEmail) {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "pending",
            message: "Reset Password Link has been sent to your account.",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: "Something went wrong" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};
