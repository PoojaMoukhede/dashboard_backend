const express = require('express');
const app = express();
const mongoose = require("mongoose");
const  bodyParser = require('body-parser');
const route = require('./Router/Web/Admin');
const e_route = require('./Router/Web/AddEmployee');
const m_route = require('./Router/Web/Manager');
const event_route = require("./Router/Web/Event")
const sendEmail = require('./utils/sendMail')
const canteen_route = require('./Router/Web/Canteen')


//Android routing
const Android_user = require('./Router/Android/User')
const Clearance_form = require('./Router/Android/ClearanceForm')
const Attandance = require('./Router/Android/Attandance')
const Location = require('./Router/Android/Location')
const Complaint = require('./Router/Android/Complaint')
const LatLong = require('./Router/Android/LatLong')

const cors = require('cors');
app.use(cors())
require('dotenv').config();
const port =process.env.PORT || 8080;



mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => { 
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB. Error: " + err);
  });

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', route);
app.use('/', e_route);
app.use('/', m_route);
app.use('/', event_route);
app.use('/',canteen_route)


// Android
app.use('/', Android_user);
app.use('/', Clearance_form);
app.use('/', Attandance);
app.use('/', Location);
app.use('/', Complaint);
app.use('/', LatLong);



app.get('/', function (req, res) {
  res.send('Hello World')
  console.log("Browser request")
  
})

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
app.post('/api/test-email', async (req, res) => {
  console.log("Email api call");
  try {
    console.log("Email api call 1");
    await sendEmail({
      to: 'pooja3000000000@gmail.com',
      from: 'poojamoukhede27@gmail.com',
      subject: 'Does this work?',
      text: 'Glad you are here .. yes you!',
      html: '<strong>It is working!!</strong>'
    });
    console.log("Email sent successfully");
    res.sendStatus(200);
  } catch (e) {
    console.error("Email send error:", e.response ? e.response.body : e.message);
    res.sendStatus(500);
  }
});



app.listen(port,()=>{console.log(`server is up on port ${port}`)});

// app.keepAliveTimeout = 60000; 
