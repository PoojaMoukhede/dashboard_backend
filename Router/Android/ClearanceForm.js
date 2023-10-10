const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const Clearance = require("../../Model/Android/ClearanceForm"); 
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Both Checked
// GET all clearances
router.get("/form", async (req, res) => {
  console.log("hello clearance get call")
  try {
    const formRecord = await Clearance.find();

    if (!formRecord) {
      return res.status(404).json({ message: "No Record records found" });
    }

    res.status(200).json({
      status: "Success",
      message: formRecord,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.log(e);
  }
});

// POST a new clearance
router.post("/form", upload.single("image"), async (req, res) => {
  console.log("hello attandance post call")
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });
    console.log(`user ------ ${user}`)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let clearance_data = await Clearance.findOne({ userRef: user._id });

    if (clearance_data) {
      // If clearance_data record exists, update it
      clearance_data.FormData.push(req.body);
      await clearance_data.save();
    } else {
      clearance_data = new Clearance({
        FormData: [req.body],
        userRef: user._id, // Ensure that user._id is correctly assigned
      });
      await clearance_data.save();
    }

    res.status(200).json({
      status: "Success",
      message: "Clearance form added successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

// router.post("/form", upload.array("images"), async (req, res) => {
//   console.log("hello attendance post call");
//   try {
//     const userId = req.body.userId;
//     const user = await User.findOne({ _id: userId });
//     console.log(`user ------ ${user}`)

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let clearance_data = await Clearance.findOne({ userRef: user._id });

//     if (clearance_data) {
//       clearance_data.FormData.push(req.body); 
//       await clearance_data.save();
//     } else {
//       clearance_data = new Clearance({
//         FormData: [req.body], 
//         userRef: user._id,
//       });
//       await clearance_data.save();
//     }

//     res.status(200).json({
//       status: "Success",
//       message: "Clearance form added successfully",
//     });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.log(e);
//   }
// });

router.get("/form/:id", async (req, res) => {
  console.log("hello attandance get ID call")

  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const Record = await Clearance.findOne({ userRef: user._id });

    if (!Record) {
      return res.status(404).json({ message: "Record record not found" });
    }

    res.status(200).json({
      status: "Success",
      message: Record,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

// router.get("/form/:id", async (req, res) => {
//   console.log("hello attandance get ID call");

//   try {
//     const userId = req.params.id;
//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const record = await Clearance.findOne({ userRef: user._id });

//     if (!record) {
//       return res.status(404).json({ message: "Record not found" });
//     }

//     // Send back the record with images as URLs
//     const recordWithImages = {
//       _id: record._id,
//       userRef: record.userRef,
//       FormData: record.FormData.map((formData) => ({
//         Transport_type: formData.Transport_type,
//         Total_expense: formData.Total_expense,
//         // Assuming you have stored image file paths in the database
//         images: formData.images.data ? `/uploads/${formData.images.data}` : null,
//         timestamp: formData.timestamp,
//       })),
//     };

//     res.status(200).json({
//       status: "Success",
//       message: recordWithImages,
//     });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.log(e);
//   }
// });


module.exports = router;