const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../../Model/Android/User");
const jwt = require("jsonwebtoken");
const secret = "SECRET";
const LeaveBalance = require("../../Model/Android/LeaveBalance")


const { format, subMonths } = require("date-fns");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Both Checked
// register
router.post(
  "/empregister",
  body("password"),
  body("confirm_password"),
  body("email").isEmail(),
  body('Emp_contact_No')
    .matches(/^\d{10}$/) 
    .withMessage('Phone number must be a 10-digit numeric value'),
  body('Emp_DOB')
    .isISO8601()
    .custom((value, { req }) => {
      // Validate that the Date of Birth is not in the future
      const dob = new Date(value);
      const today = new Date();
      if (dob > today) {
        throw new Error('Date of Birth cannot be in the future');
      }
      return true;
    }),
   body('Emp_joining_date')
    .isISO8601()
    .custom((value, { req }) => {
      // Validate that the Date of Joining is not in the future
      const joiningDate = new Date(value);
      const today = new Date();
      if (joiningDate > today) {
        throw new Error('Date of Joining cannot be in the future');
      }
      return true;
    }),
  async (req, res) => {
    try {
      const existingUser = await User.findOne({ Emp_ID: req.body.Emp_ID });
      if (existingUser) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Employee ID already exists',
        });
      }
      const repeatedEmail = await User.find({ email: req.body.email });
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
            const user = await User.create({
              Emp_ID: req.body.Emp_ID,
              Emp_name: req.body.Emp_name,
              email: req.body.email,
              Emp_contact_No: req.body.Emp_contact_No,
              Emp_department: req.body.Emp_department,
              Emp_city: req.body.Emp_city,
              Emp_state: req.body.Emp_state,
              Emp_DOB: req.body.Emp_DOB,
              Emp_joining_date: req.body.Emp_joining_date,
              Emp_blood_group: req.body.Emp_blood_group,
              Emp_qualification: req.body.Emp_qualification,
              Emp_expertise: req.body.Emp_expertise,
              password: hash,
              Emp_designation:req.body.Emp_designation,
              Emp_country:req.body.Emp_country
            });
            const newLeaveBalance = await LeaveBalance.create({
              userRef: user._id,
              availableLeave: 21, 
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

router.post("/emplogin", async (req, res) => {
  const email = req.body.email;
  const Emp_ID = req.body.Emp_ID;
  const password = req.body.password;

  try {
    const userData = await User.findOne({ email: email });
    const userDataID = await User.findOne({ Emp_ID: Emp_ID });

    if (userDataID) {
      const passwordMatch = await bcrypt.compare(password, userDataID.password);
      if (passwordMatch) {
        res.status(200).json({
          status: "Successful",
          userId: userData._id,
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    } else if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        res.status(200).json({
          status: "Successful",
          userId: userData._id,
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    } else {
      res.status(404).json({
        status: "failed",
        message: "No user found",
      });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

//getting all user
router.get("/empdata", async (req, res) => {
  try {
    const results = await User.find();
    res.json(results);
    console.log("result in get", results);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
}); 

// for birthday and work anniversary updated 
router.get('/updates', async (req, res) => {
  try {
    const users = await User.find();

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed, so add 1
    const currentYear = currentDate.getFullYear();

    const usersWithBirthday = [];
    const usersWithWorkAnniversary = [];

    users.forEach((user) => {
      const dob = new Date(user.Emp_DOB);
      const joinDate = new Date(user.Emp_joining_date);

      if (dob.getMonth() + 1 === currentMonth) {
        usersWithBirthday.push({
          Emp_name: user.Emp_name,
          date: `${dob.getDate()}/${currentMonth}/${currentYear}`,
          type: 'birthday',
          email:user.email
        });
      }

      const joinMonth = joinDate.getMonth() + 1;
      if (joinMonth === currentMonth) {
        usersWithWorkAnniversary.push({
          Emp_name: user.Emp_name,
          date: `${joinDate.getDate()}/${currentMonth}/${currentYear}`,
          type: 'work anniversary',
          email:user.email
        });
      }
    });

    const response = {
      usersWithBirthday,
      usersWithWorkAnniversary,
    };

    res.json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


router.get("/user/:id", async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ employee: "Employee not found" });
    }

    res.json(employee);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
});



module.exports = router;
