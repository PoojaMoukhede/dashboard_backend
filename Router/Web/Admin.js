const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const Admin = require("../../Model/Web/Admin");
const jwt = require("jsonwebtoken");
const secret = "SECRET";
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();
const fs = require("fs");
const path = require("path");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// register
router.post(
  "/register",
  body("password"),
  body("confirm_password"),
  body("email").isEmail(),
  body("phone_no")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be a 10-digit numeric value"),
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
              name: req.body.name,
              email: req.body.email,
              password: hash,
              phone_no: req.body.phone_no,
              admin_city: req.body.admin_city,
              admin_state: req.body.admin_state,
              admin_country: req.body.admin_country,
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
      console.log(req.body);
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
      console.log("Comparison error: ", err);
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
router.get("/get/:id", async (req, res) => {
  try {
    const ID = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    const adminData = await Admin.findOne({ _id: ID });

    if (adminData) {
      res.json(adminData);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//getting all admin
router.get("/getAdmin", async (req, res) => {
  try {
    const results = await Admin.find();
    res.json(results);
    // console.log( "result in get" ,results )
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.delete("/admin/:id", async (req, res) => {
  const ID = req.params.id;
  const admin_data = await Admin.findOneAndDelete({ _id: ID });
  res.send("Event's data has been Deleted");
});

router.put("/admin/:id", async (req, res) => {
  try {
    const data = req.body;
    const admin = await Admin.findOneAndUpdate({ _id: req.params.id }, data);
    res.json({ result: admin });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

const storage = multer.memoryStorage();
const upload2 = multer({ storage: storage });

router.put("/update-profile-image/:id", upload2.single("profileImage"), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Admin.findOneAndUpdate({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(req.file);
    if (req.file) {
      const fileName = req.file.originalname;
      console.log(fileName);
      fs.writeFileSync(path.join("uploads2/", fileName), req.file.buffer);

      user.profileImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      await user.save();
    }

    res.status(200).json({ message: "Profile image updated successfully", user: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
