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
        this.transporter.sendMail({
            from: this.senderEmail,
            to: email,
            subject: 'Confirmation de compte',
            text: 'Votre compte a été créé avec succès.'
        });
    }

    newPasswordConfirmation(email,newPassword) {
        this.transporter.sendMail({
            from: this.senderEmail,
            to: email,
            subject: 'Mot de passe temporaire',
            text: 'Votre nouveau mot de passe temporaire est : ' +  newPassword
        });
    }

}

module.exports = new Emailer();