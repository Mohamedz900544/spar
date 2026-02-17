import cloudinary from './config/cloudinary.js'
import { Readable } from 'stream'
import transporter from './config/nodemailer.js'
import jsonwebtoken from 'jsonwebtoken'

// eslint-disable-next-line no-unused-vars
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

export const uploadFromStream = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.v2.uploader.upload_stream({
            folder: "profile_pictures"
        }, (err, result) => {
            if (result) {
                resolve(result)
            } else {
                reject(err)
            }
        })
        Readable.from(buffer).pipe(cld_upload_stream)
    })

}

/**
 * 
 * @param {*} email 
 * @param {*} verificationToken 
 * @returns {Promise<SMTPTransport.SentMessageInfo>}
 */

export const sendVerificationMail = (email, verificationToken) => {
    // 1. Construct the full link (Adjust CLIENT_URL to your frontend URL)
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    console.log('Sending Email')
    return new Promise((resolve, reject) => {
        return transporter.sendMail({
            from: `SPAV <${process.env.NODEMAILER_EMAIL}>`,
            to: email,
            subject: "Verify your email address for SPAV", // Added Subject
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #333; margin: 0;">Welcome to SPAV!</h2>
                </div>

                <p style="color: #555; font-size: 16px; line-height: 1.5;">Hi there,</p>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                    Thanks for getting started with SPAV. We just need to verify your email address to complete your registration.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>

                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                    This link will expire in 15 minutes. If you didn't create an account, you can safely ignore this email.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                <p style="color: #aaa; font-size: 12px; text-align: center;">
                    If the button doesn't work, copy and paste the link below into your browser:
                </p>
                <p style="text-align: center; word-break: break-all;">
                    <a href="${verificationUrl}" style="color: #4CAF50; font-size: 12px;">${verificationUrl}</a>
                </p>
            </div>
            `,
        }, (err, info) => {
            if (err) {
                console.log('Failed To Send Email', err.message)
                reject(err);
            } else {
                console.log('Email Sent Successfully')
                resolve(info);
            }
        });
    });
};
export const createValidationToken = (payload) => {
    const verificationToken = jsonwebtoken.sign(payload, process.env.VERIFICATION_SECRET, {
        expiresIn: '15m'
    });
    return verificationToken
}