const express = require('express')
const app = express();
const mongoose = require("mongoose");
const  bodyParser = require('body-parser');
const adminRoute = require('./Router/Admin');
const admin = require('./Model/Admin');
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
app.use('/', adminRoute);

app.get('/', function (req, res) {
  res.send('Hello World')
})
  
  
app.listen(port,()=>{console.log(`server is up on port ${port}`)});


