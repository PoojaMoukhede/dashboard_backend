const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../../Model/Android/User")
const jwt = require("jsonwebtoken");
const secret = "SECRET";


router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Both Checked
// register
router.post(
  "/empregister",
  body("password"),
  body("confirm_password"),
  body("email").isEmail(),
  async (req, res) => {
    try {
      const repeatedEmail = await User.find({ email: req.body.email });
      if (repeatedEmail.length === 0) {
       
        const errors = validationResult(req);
        // console.log("Data from anddroid",res)
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
            await User.create({
              name:req.body.name,
              email: req.body.email,
              password: hash,
              // Emp_ID:req.body.Emp_ID
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
      } 
       console.log("data from android",req.body)
    } catch (error) {
      res.status(500).json({
        status: "Failed",
        message: err.message,
      });
    }
  }
 
);

//login
router.post("/emplogin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const UserData = await User.findOne({ email: email });
  if (UserData != null) {
    try {
      const result = await bcrypt.compare(password, UserData.password);
      if (result) {
        const token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // Fix: Divide by 1000 to get seconds
            User: UserData._id,
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
      message: "No user Found",
    });
  }
});
 
//getting all user
router.get('/empdata', async (req, res) => {  
    try {
        const results = await User.find();
        res.json(results);
        // console.log( "result in get" ,results )
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
  })

module.exports = router;
