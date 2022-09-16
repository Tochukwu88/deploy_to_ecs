import nodemailer from 'nodemailer';
import AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-west-3' });

// create reusable transporter object using the default SMTP transport
const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.NODEMAILER_EMAIL_ACCOUNT,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD
    },
});

export const uniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const generateRandomFourDigits = () => Math.floor(1000 + Math.random() * 9000);

export const sendMail = (referenceId, name, base64Attachment) => {
    // send mail with defined transport object
    return mailTransporter.sendMail({
        from: `"${name}" <bonitasmailer@gmail.com>`, // sender address
        // to: "gerald.nnebe@bonitasict.com, gerald.nnebe@bonitasict.com", // list of receivers
        to: "bonitasict@gmail.com, bonitasict@gmail.com", // list of receivers
        subject: `${Date.now()} GVE Groundbreaking app offline payment receipt/`, // Subject line
        // text: `From ${req.body.name}: ${req.body.body}`, // plain text body
        html: `<p><b>From: ${name}</b></p><p><b>Reference Id: ${referenceId}</b></p>`,
        attachments: [{   // stream as an attachment
            filename: 'receipt.png',
            content: Buffer.from(base64Attachment, 'base64')
        }]
    }).then(() => {
        // console.log("Message sent: %s", info.messageId);

        // res.status(200).send('Message sent successfully');
    }).catch(e => console.error(e));
};

export const sendOtp = (email, mobileNumber, otp) => {
    mobileNumber = '+2348087272029';

    // Create SMS Attribute parameters
    var attr = {
        attributes: {
            'DefaultSMSType': 'Transactional', /* highest reliability */
            //'DefaultSMSType': 'Promotional' /* lowest cost */
        }
    };
    var params = {
        Message: "Welcome! your mobile verification code is: "
            + otp + ", and your mobile Number is:" + mobileNumber,
        PhoneNumber: mobileNumber
    };

    // Create promise and SNS service object
    // let sns = new AWS.SNS({ apiVersion: '2010-03-31' });
    // sns.setSMSAttributes(attr);

    // sns.publish(params).promise().then(message => {
    //     console.log(message)
    //     console.log("OTP SEND SUCCESS");
    // })
    //     .catch(err => {
    //         console.error("Error " + err)
    //         return err;
    //     });

    // also send OTP through mail
    return mailTransporter.sendMail({
        from: `"GVE App" <bonitasmailer@gmail.com>`, // sender address
        to: `${email}, ${email}`, // list of receivers
        subject: `GVE App OTP`,
        html: `<p>Your GVE App OTP is<p><b>${otp}</b></p>`,
    }).catch(e => console.error(e));
}
