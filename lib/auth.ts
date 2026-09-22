import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import {
  admin as adminPlugin,
  emailOTP,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";

import { ac, admin, staff } from "./permission";
import { nextCookies } from "better-auth/next-js";
import { sendEmail, sendEmailOrThrow } from "./brevo";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await sendEmailOrThrow({
        to: user.email,
        subject: "Reset Your Password - Cholera Outbreak Prediction System",
        text: `Click the link to reset your password: ${url}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #1e3a8a;">Reset your password</h2>
            <p>Hello ${user.name || "User"},</p>
            <p>You requested a password reset for your account on the <strong>ML-Driven Cholera Outbreak Prediction System</strong>.</p>
            <div style="margin: 24px 0;">
              <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="${url}">${url}</a></p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #9ca3af; font-size: 11px;">ML-Driven Cholera Outbreak Prediction System</p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  appName: "ML-Driven Cholera Outbreak Prediction System",
  plugins: [
    adminPlugin({
      defaultRole: "staff",
      ac,
      roles: { admin, staff },
    }),
    phoneNumber(),
    username(),
    twoFactor(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      resendStrategy: "rotate",
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "email-verification") {
          await sendEmailOrThrow({
            to: email,
            subject: `${otp} is your Cholera Prediction verification code`,
            text: `Your Cholera Prediction verification code is ${otp}. It expires in 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify your email</h2>
                <p>This code was requested for <strong>${email}</strong> on the <strong>ML-Driven Cholera Outbreak Prediction System</strong>.</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <code style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</code>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <hr style="margin: 20px 0;" />
                <p style="color: #6b7280; font-size: 12px;">ML-Driven Cholera Outbreak Prediction System</p>
              </div>
            `,
          });
        } else if (type === "sign-in") {
          await sendEmailOrThrow({
            to: email,
            subject: "Your OTP for Sign-In",
            text: `Your verification sign-in code is ${otp}.`,
            html: `<p>Your OTP for sign-in is: <strong>${otp}</strong></p>`,
          });
        } else {
          await sendEmailOrThrow({
            to: email,
            subject: "Your OTP Code",
            text: `Your verification OTP code is ${otp}.`,
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
          });
        }
      },
    }),
    nextCookies(),
  ],
});
