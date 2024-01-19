const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text');

module.exports = class Email{
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours Team <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                secure: false,
                auth: {
                    user: "samaraweerairash@gmail.com",
                    pass: "xsmtpsib-1702272c2d5d58384d03a6df5545e3598a54c1d5bd62078ae0a1f7e2ba85214d-JZwHMqXF2shd9rLp",
                },
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template, subject) {
        //send the actal email
        // 1) render html based on pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject

        })

        // 2) define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html)
        };
        
        // 3) create a transport and send the email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome() {
        //send welcome email
        await this.send('welcome', 'Welcome to the Natours Family!')
    }

    async sendPasswordReset() {
        await this.send('resetPassword', 'Password Reset Token (Valid only for 10 mins)')
    }
}
