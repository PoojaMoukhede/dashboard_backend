const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../../Model/Android/User")
const jwt = require("jsonwebtoken");
const secret = "SECRET";
const Fuel = require("../../Model/Web/Fuel")
const Expanse = require('../../Model/Web/Expanse')
const { format, subMonths } = require("date-fns"); 
// const Employee = require("../../Model/Web/AddEmployee");

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
    // User.init()
    console.log('hello register')
    try {
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
            await User.create({
              Emp_ID:req.body.Emp_ID,
              Emp_name: req.body.Emp_name,
              email:req.body.email,
              Emp_contact_No: req.body.Emp_contact_No,
              Emp_department: req.body.Emp_department,
              Emp_city: req.body.Emp_city,
              Emp_state:req.body.Emp_state,
              Emp_DOB: req.body.Emp_DOB,
              Emp_joining_date:req.body.Emp_joining_date,
              Emp_blood_group:req.body.Emp_blood_group,
              Emp_qualification:req.body.Emp_qualification,
              Emp_expertise:req.body.Emp_expertise,
              password: hash
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

router.post("/emplogin", async (req, res) => {
  const email = req.body.email;
  const Emp_ID = req.body.Emp_ID
  const password = req.body.password;
  console.log('hello login')

  try {
    const userData = await User.findOne({email: email });
    const userDataID = await User.findOne({Emp_ID:Emp_ID})

    if (userDataID) {
      const passwordMatch = await bcrypt.compare(password, userDataID.password);
      if (passwordMatch) {
        res.status(200).json({
          status: "Successful",
          userId:userData._id
        });
      } else {
        res.status(401).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    }
    else if(userData){
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        res.status(200).json({
          status: "Successful",
          userId:userData._id
        });
console.log(`user : ${User}`)
      } else {
        res.status(401).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    }
    
    else {
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
router.get('/empdata', async (req, res) => {  
  console.log("get request by android")
    try {
        const results = await User.find();
        res.json(results);
        console.log( "result in get" ,results )
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
  })

  router.get('/user/:id', async (req, res) => {  
    const employeeId = req.params.id;
    try {
        const employee = await User.findById(employeeId);
  
        if (!employee) {
            return res.status(404).json({ employee: 'Employee not found' });
        }
  
        res.json(employee);
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.error(e);
    }
  });



  router.get("/fuel", async (req, res) => {
    try {
      const results = await Fuel.find();
      res.json(results);
      // console.log("Result in GET:", results);
    } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
    }
  });
  
// fuel
router.post("/fuel", async (req, res) => {
  try {
    const { month, Liters } = req.body;
    const newFuelConsumption = new Fuel({
      month,
      Liters,
    });
    const insertedData = await newFuelConsumption.save();
    res.json(insertedData);
    console.log("Inserted data:", insertedData);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
})


router.get("/fuel", async (req, res) => {
  try {
    const results = await Fuel.find();
    res.json(results);
    // console.log("Result in GET:", results);
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
});
router.get("/fuel/curr", async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = format(currentDate, "MMMM"); // Format the current month
    
    const results = await Fuel.find({ month: currentMonth });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
  
// expanse
  // router.post("/expanse", async (req, res) => {
  //   try {

  //     // const fuelData = req.body.FuelConsumption;
  //     // const insertedData = await Fuel.create({ FuelConsumption: fuelData });
  //     const insertedData = await Expanse.create(req.body);

  
  //     res.json(insertedData);
  //     console.log("Inserted data:", insertedData);
  //   } catch (e) {
  //     res.status(400).json({ message: e.message });
  //     console.log(e);
  //   }
  // });


  // router.get("/expanse", async (req, res) => {
  //   try {
  //     const results = await Expanse.find();
  //     res.json(results);
  //     // console.log("Result in GET:", results);
  //   } catch (e) {
  //     res.status(400).json({ message: e.message });
  //     console.log(e);
  //   }
  // });

  router.post("/expanse", async (req, res) => {
    try {
      const { money,month } = req.body;
      const currentDate = new Date();
      // const currentMonth = format(currentDate, "MMMM"); // Format the current month
      
      const newExpense = new Expanse({
        month,
        money,
      });
  
      await newExpense.save();
      res.status(201).json(newExpense);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    } 
  });


router.get("/expanse", async (req, res) => {
  try {
    const expenses = await Expanse.find();
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/expanse/curr", async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = format(currentDate, "MMMM"); // Format the current month
    
    const expenses = await Expanse.find({ month: currentMonth });

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/expanse/prev", async (req, res) => {
  try {
    const currentDate = new Date();
    const previousMonth = format(subMonths(currentDate, 1), "MMMM"); // Subtract 1 month from the current date and format it

    const expenses = await Expanse.find({ month: previousMonth });

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
