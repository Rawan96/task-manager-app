require('env2')('./.env');
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.sendGridAPIKey)

const sendWelcomeEmail = (email , name)=>{
  sgMail.send({
    to: email,
    from: 'rawan.designer@hotmail.com',
    subject: 'Welcome to the App, Hope you Have a Great Experience',
    text: `Welcome to the app ${name}, Let us know how you get along with the app`,

  })
}

const sendGoodByeEmail = (email, name)=>{
  sgMail.send({
    to:email,
    from:'rawan.designer@hotmail.com',
    subject:'Sorry to See You Go!',
    text:`Goodbye ${name}, We Hope to See You Soon`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodByeEmail
}