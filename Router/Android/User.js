const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../../Model/Android/User")
const jwt = require("jsonwebtoken");
// const { default: mongoose } = require("mongoose");
const secret = "SECRET";
const Fuel = require("../../Model/Web/Fuel")
const Expanse = require('../../Model/Web/Expanse')


router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Both Checked
// register
// router.post(
//   "/empregister",
//   body("password"),
//   body("confirm_password"),
//   body("email").isEmail(),
//   async (req, res) => {
//     // User.init()
//     console.log('hello register')
//     try {
//       const repeatedEmail = await User.find({ email: req.body.email });
//       if (repeatedEmail.length === 0) {
       
//         const errors = validationResult(req);
//         // console.log("Data from anddroid",res)
//         if (!errors.isEmpty()) {
//           res.status(400).json({
//             status: "Failed By Validator",
//             message: errors.array(),
//           });
//         } else {
//           const { password, confirm_password } = req.body; 
//           if (password != confirm_password)
//             return res.status(400).json({ message: "password doesnot match" });

//           const salt = await bcrypt.genSalt(12);
//           bcrypt.hash(req.body.password, salt, async (err, hash) => {
//             await User.create({
//               // _id:mongoose.Schema.Types.ObjectId,
//               name:req.body.name,
//               email: req.body.email,
//               password: hash,
//               Emp_ID:req.body.Emp_ID
//             });
//           });
//           res.status(200).json({
//             status: "Success",
//             message: "Please Login",
//           });
//         }
//       } else {
//         res.status(400).json({
//           status: "Failed",
//           error: "User Already Exists",
//         });
//       } 
//        console.log("data from android",req.body)
//     } catch (error) {
//       res.status(500).json({
//         status: "Failed",
//         message: err.message,
//       });
//     }
//   }
 
// );

router.post("/emplogin", async (req, res) => {
  const email = req.body.email;
  const Emp_ID = req.body.Emp_ID
  const password = req.body.password;
  console.log('hello login')

  try {
    // Find the user by email
    const userData = await User.findOne({ email: email });
    // Find the user by Emp_ID
    const userDataID = await User.findOne({Emp_ID:Emp_ID})

// check with employee ID
    if (userDataID) {
      const passwordMatch = await bcrypt.compare(password, userDataID.password);

      if (passwordMatch) {
        // const token = jwt.sign(
        //   {
        //     User: userDataID._id,
        //   },
        //   secret,
        //   // { expiresIn: "1h" }
        //   { expiresIn: "24h" }

        // );
        res.status(200).json({
          status: "Successful",
          // token: token,
          userId:userData._id
        });
        console.log(token)
        console.log(`crediantial : ${userDataID}`)
      } else {
        // Incorrect password
        res.status(401).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    }
    // check with employee email
    else if(userData){
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        const token = jwt.sign(
          {
            User: userData._id,
          },
          secret,
          // { expiresIn: "1h" }
          { expiresIn: "24h" }
        );

        // Respond with a success message and the token
        res.status(200).json({
          status: "Successful",
          token: token,
          // userId:userData._id
        });
        // console.log(token)
        console.log(`crediantial : ${userData}`)
      } else {
        // Incorrect password
        res.status(401).json({
          status: "failed",
          message: "Wrong password",
        });
      }
    }
    
    else {
      // User not found
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

  router.get("/fuel", async (req, res) => {
    try {
      const results = await Fuel.find();
      res.json(results);
      console.log("Result in GET:", results);
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


  // router.post("/fuel", async (req, res) => {
  //   try {

  //     const fuelData = req.body.FuelConsumption;
  //     // const insertedData = await Fuel.create({ FuelConsumption: fuelData });
  //     const insertedData = await Fuel.create(req.body);

  
  //     res.json(insertedData);
  //     console.log("Inserted data:", insertedData);
  //   } catch (e) {
  //     res.status(400).json({ message: e.message });
  //     console.log(e);
  //   }
  // });
  // router.get("/fuel", async (req, res) => {
  //   try {
  //     const results = await Fuel.find();
  //     res.json(results);
  //     console.log("Result in GET:", results);
  //   } catch (e) {
  //     res.status(400).json({ message: e.message });
  //     console.log(e);
  //   }
  // });
  
// expanse
  router.post("/expanse", async (req, res) => {
    try {

      // const fuelData = req.body.FuelConsumption;
      // const insertedData = await Fuel.create({ FuelConsumption: fuelData });
      const insertedData = await Expanse.create(req.body);

  
      res.json(insertedData);
      console.log("Inserted data:", insertedData);
    } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
    }
  });
  router.get("/expanse", async (req, res) => {
    try {
      const results = await Expanse.find();
      res.json(results);
      // console.log("Result in GET:", results);
    } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
    }
  });

module.exports = router;
