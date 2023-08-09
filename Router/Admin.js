const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const Admin = require("../Model/Admin");
const jwt = require("jsonwebtoken");
const secret = "SECRET";
const mongoose = require("mongoose")




router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// register
router.post(
  "/register",
  body("password"),
  body("confirm_password"),
  body("email").isEmail(),
  async (req, res) => {
    try {
      const repeatedEmail = await Admin.find({ email: req.body.email });
      if (repeatedEmail.length === 0) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({
            status: "Failed By Validator",
            message: errors.array(),
          });
        } else {
          const { password, confirm_password } = req.body;
          if (password != confirm_password)
            return res.status(400).json({ message: "password doesnot match" });

          const salt = await bcrypt.genSalt(12);
          bcrypt.hash(req.body.password, salt, async (err, hash) => {
            await Admin.create({
              name:req.body.name,
              email: req.body.email,
              password: hash,
            });
          });
          res.status(200).json({
            status: "Success",
            message: "Please Login",
          });
        }
      } else {
        res.status(400).json({
          status: "Failed",
          error: "User Already Exists",
        });
      }  console.log(req.body)
    } catch (error) {
      res.status(500).json({
        status: "Failed",
        message: err.message,
      });
    }
  }
 
);

//login
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const adminData = await Admin.findOne({ email: email });
  if (adminData != null) {
    try {
      const result = await bcrypt.compare(password, adminData.password);
      if (result) {
        const token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // Fix: Divide by 1000 to get seconds
            Admin: adminData._id,
          },
          secret
        );
        res.status(200).json({
          Status: "Successful",
          token: token,
        });
      } else {
        res.status(400).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    } catch (err) {
      console.log('Comparison error: ', err);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  } else {
    res.status(400).json({
      status: "failed",
      message: "No Admin Found",
    });
  }
});
 
// getting name for rendering in sidebar 
router.get('/get/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ObjectId format' });
    }

    const adminData = await Admin.findOne({ _id: id });

    if (adminData) {
      res.json(adminData);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


//getting all admin
router.get('/getAdmin', async (req, res) => {  
  try {
      const results = await Admin.find();
      res.json(results);
      // console.log( "result in get" ,results )
  } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
  }
 
})

module.exports = router;
