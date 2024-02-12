const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

class Emailer {

    constructor() {
        this.senderEmail = process.env.SenderEmail;
        this.psw = process.env.MONGO_DATABASE;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
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