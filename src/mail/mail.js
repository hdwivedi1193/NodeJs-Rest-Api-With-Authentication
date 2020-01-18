const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendMail=(email,name)=>{

    const msg = {
      to: email,
      from: 'Please add sender email here',
      subject: 'User Creation',
      text: 'Testing',
      html: '<strong>Welcome '+`${name}`+'</strong>',
    };
    sgMail.send(msg);
}


module.exports=sendMail