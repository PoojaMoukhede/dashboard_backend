const sendgrid = require ('@sendgrid/mail');

require('dotenv').config();


sendgrid.setApiKey(process.env.API_KEY);

const sendEmail = ({ to, from, subject, text, html }) => {
  const msg = { to, from, subject, text, html };
  return sendgrid.send(msg);
};

module.exports = sendEmail;