const express = require("express");
const router = express.Router();
const Location = require("../../Model/Android/Location")
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")


router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Both Checked
router.get('/getlocation', async (req, res) => {  
  console.log("hello Location get call")

    if (req.headers.token !== null) {
        jwt.verify(req.headers.token, secret, (err, user) => {
          if (err) console.log(err.message);
          else req.user = user.data;
        });
        try {
          const data = await Location.find({ userRef: req.user });
          res.status(200).json({
            status: "Sucess",
            message: data,
          });
        } catch (error) {
          res.status(500).json({
            status: "Failed",
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          status: "Failed",
          message: "Please Refresh the Page",
        });
      }
   
})


router.get("/getlocation/:Emp_ID", async (req, res) => {
  console.log("hello Location get Emp_ID call")
  try {
    const empId = req.params.Emp_ID;
    const user = await User.findOne({ Emp_ID: empId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const location = await Location.findOne({ userRef: user._id });

    if (!location) {
      return res.status(404).json({ message: "Location record not found" });
    }
    res.status(200).json({
      status: "Success",
      message: location,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


router.post('/location', async (req, res) => { 
  console.log("hello Location post call")
    try {
      console.log('Header: '+ req.headers)
      console.log('Header Token: '+ req.headers.token)
      const decoded = jwt.verify(req.headers.token, secret);
      console.log(decoded)
      const empId = decoded.User; 
   console.log(`empID ------ ${empId}`)
      const user = await User.findOne({ _id: empId });
      console.log(`user ------ ${user}`)
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let location = await Location.findOne({ userRef: user._id });
  
      if (location) {
        location.Location_info.push(req.body);
        await location.save();
      } else {
        location = new Location({
          Location_info: [req.body],
          userRef: user._id, 
        });
        await location.save();
      }
  
      res.status(200).json({
        status: "Success",
        message: "Location added successfully",
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
    }
});


module.exports= router