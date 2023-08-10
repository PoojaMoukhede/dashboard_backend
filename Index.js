const express = require('express');
const app = express();
const mongoose = require("mongoose");
const  bodyParser = require('body-parser');
const route = require('./Router/Admin');
const e_route = require('./Router/AddEmployee');
const m_route = require('./Router/Manager');
require('dotenv').config();
const port =process.env.PORT || 8080;
const cors = require('cors');


app.use(cors())


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

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(port,()=>{console.log(`server is up on port ${port}`)});


