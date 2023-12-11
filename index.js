const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("./Router/Web/Admin");
const e_route = require("./Router/Web/AddEmployee");
const event_route = require("./Router/Web/Event");
const Leave_route = require("./Router/Android/Leave");
const notification = require("./Router/Web/Notification");
const canteen_route = require("./Router/Web/Canteen");
const nodemailer = require("nodemailer");
const path = require("path");

//Android routing
const Android_user = require("./Router/Android/User");
const Clearance_form = require("./Router/Android/ClearanceForm");
const Attandance = require("./Router/Android/Attandance");
const Location = require("./Router/Android/Location");
const Complaint = require("./Router/Android/Complaint");
const uploadMiddleware = require("./Middleware/Uploads");
const Customer = require("./Router/Android/Customer")
const CompanyProperty = require('./Router/Android/CompanyProperty')

require("request").defaults({ rejectUnauthorized: false });

const cors = require("cors");
app.use(cors());
require("dotenv").config();
const port = process.env.PORT || 80;

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
app.use(bodyParser.json({ limit: 1024 * 1024 * 20, type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: 1024 * 1024 * 20,
    type: "application/x-www-form-urlencoding",
  })
);

app.use(express.urlencoded({ limit: "50mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/", route);
app.use("/", e_route);
app.use("/", event_route);
app.use("/", canteen_route);
app.use("/", notification);

// Android
app.use("/", Android_user);
app.use("/", Clearance_form);
app.use("/", Attandance);
app.use("/", Location);
app.use("/", Complaint);
app.use("/", Leave_route);
app.use('/', Customer)
app.use('/',CompanyProperty)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/", function (req, res) {
  res.send("Hello World");
  console.log("Browser request");
});


app.listen(8080, () => {
  console.log(`server is up on port ${port}`);
});
