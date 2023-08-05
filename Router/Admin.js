const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const Admin=require('../Model/Admin')
const jwt = require("jsonwebtoken");
const secret = "SECRET";


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//register
router.post("/register",body("password"),body("confirm_password"),body("email").isEmail(),
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
              return res.status(400).json({ message: "Password doesnot match" });
  
            const salt = await bcrypt.genSalt(12);
            bcrypt.hash(req.body.password, salt, async (err, hash) => {
              await Admin.create({
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
        }
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
    const userData = await Admin.findOne({ email: email });
    if (userData != null) {
      var result = await bcrypt.compare(password, userData.password);
      if (result) {
        const token = jwt.sign(
          {
            exp: Math.floor(Date.now() / 10) + 60 * 60,
            data: userData._id,
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
          message: "Wrong Password",
        });
      }
    } else {
      res.status(400).json({
        status: "failed",
        message: "No user Found",
      });
    }
  });
  
module.exports = router