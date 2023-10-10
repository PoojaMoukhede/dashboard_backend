const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("./Router/Web/Admin");
const e_route = require("./Router/Web/AddEmployee");
const m_route = require("./Router/Web/Manager");
const event_route = require("./Router/Web/Event");
// const sendEmail = require('./utils/sendMail')
const canteen_route = require("./Router/Web/Canteen");
const nodemailer = require("nodemailer");
const path = require('path')
//Android routing
const Android_user = require("./Router/Android/User");
const Clearance_form = require("./Router/Android/ClearanceForm");
const Attandance = require("./Router/Android/Attandance");
const Location = require("./Router/Android/Location");
const Complaint = require("./Router/Android/Complaint");
// const LatLong = require('./Router/Android/LatLong')

const cors = require("cors");
app.use(cors());
require("dotenv").config();
const port = process.env.PORT || 8080;

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB. Error: " + err);
  });

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
app.use("/", route);
app.use("/", e_route);
app.use("/", m_route);
app.use("/", event_route);
app.use("/", canteen_route);

// Android
app.use("/", Android_user);
app.use("/", Clearance_form);
app.use("/", Attandance);
app.use("/", Location);
app.use("/", Complaint);
// app.use('/', LatLong);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get("/", function (req, res) {
  res.send("Hello World");
  console.log("Browser request");
});

// app.post('/api/test-email', async(req, res)=>{
//   console.log("Email api call")
//   try {
//     console.log("Email api call 1 ")
//       await sendEmail({
//           to: 'pooja3000000000@gmail.com',
//           from: 'poojamoukhede27@gmail.com',
//           subject: 'Does this work?',
//           text: 'Glad you are here .. yes you!',
//           html:'<strong>It is working!!</strong>'
//       });
//       res.sendStatus(200);
//       console.log("Email api call 2 ")
//   } catch (e) {
//       console.log(e);
//       res.sendStatus(500);
//   }
// });

// for web only
app.post("/api/test-email", async (req, res) => {
  console.log("Email api call");
  try {
    console.log("Email api call 1");
    await sendEmail({
      to: "pooja3000000000@gmail.com",
      from: "poojamoukhede27@gmail.com",
      subject: "Does this work?",
      text: "Glad you are here .. yes you!",
      html: "<strong>It is working!!</strong>",
    });
    console.log("Email sent successfully");
    res.sendStatus(200);
  } catch (e) {
    console.error(
      "Email send error:",
      e.response ? e.response.body : e.message
    );
    res.sendStatus(500);
  }
});

function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.API_KEY,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8"> 
  <title>CodePen - OTP Email Template</title>
</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Koding 101 Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

app.get("/", (req, res) => {
  console.log(process.env.MY_EMAIL);
});

app.post("/send_recovery_email", (req, res) => {
  sendEmail(req.body)
    // main()
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

// var transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "edd4bd511f722d",
//     pass: "8fc69c9724dd75"
//   }
// });

// async function main() {
//   const info = await transport.sendMail({
//     to: 'poojamoukhede27@gmail.com',
//     from: 'pooja3000000000@gmail.com',
//     subject: "Hello ✔",
//     text: "Hello world?",
//     html: "<b>Hello world?</b>",
//   });

//   console.log("Message sent: %s", info.messageId);

// }

app.listen(port, () => {
  console.log(`server is up on port ${port}`);
});

// app.keepAliveTimeout = 60000;
