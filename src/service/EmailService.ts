import nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";
// import ContactDto from "src/models/ContactDto";

@Injectable()
export default class EmailService {
    private transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT!),
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async SendFreelancerNotifEmail(contact: any) {
        const mailOptions = {
            from: "joe@josephsoftwareservices.com",
            to: "josephplaugher@gmail.com",
            subject: "New Client Contact Request",
            html: `
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; flex-direction: row;">
                    <p style="margin-right: 10px;">Name:</p><p>${contact.Name}</p>
                </div>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; flex-direction: row;">
                    <p style="margin-right: 10px;">Email:</p><p>${contact.Email}</p>
                </div>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; flex-direction: row;">
                    <p style="margin-right: 10px;">Message:</p><p>${contact.Message}</p>
                </div>
            </div>
            `
        }

        try {
            const result = await this.transporter.sendMail(mailOptions)
            console.log(result);
            return result
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}
