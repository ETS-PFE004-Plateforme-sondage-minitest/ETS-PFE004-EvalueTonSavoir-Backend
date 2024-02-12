const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

class Emailer {

    constructor() {
        this.senderEmail = process.env.SENDER_EMAIL;
        this.psw = process.env.EMAIL_PSW;
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: this.senderEmail,
                pass: this.psw
            }
        });
    }

    registerConfirmation(email) {
        transporter.sendMail({
            from: this.senderEmail,
            to: email,
            subject: 'Confirmation de compte',
            text: 'Votre compte a été créé avec succès.'
        });
    }

}

module.exports = new Emailer();