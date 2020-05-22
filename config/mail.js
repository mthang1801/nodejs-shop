const nodemailer = require('nodemailer');
const config = require("config");

const sendEmail = (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    port : "587",
    host : "smtp.gmail.com",
    secure : false , 
    auth : {
      user : config.get("EMAIL_USER"),
      pass : config.get("EMAIL_PSW")
    }
  })

  const options = {
    to : to,  
    from : "shop@mvt-shop.com",         
    subject: subject ,
    html : htmlContent 
  };

  return transporter.sendMail(options);
}

module.exports = sendEmail;