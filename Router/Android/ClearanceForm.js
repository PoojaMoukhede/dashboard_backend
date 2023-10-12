const express = require("express");
const router = express.Router();
const multer = require("multer");
const Clearance = require("../../Model/Android/ClearanceForm");
const jwt = require("jsonwebtoken");
const secret = "SECRET";
const User = require("../../Model/Android/User");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Both Checked
// GET all clearances
router.get("/form", async (req, res) => {
  console.log("hello clearance get call");
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


router.post("/form", upload.single("image"), async (req, res) => {
  console.log("Hello form post call");
  try {
    const userId = req.body.userId;
    // console.log(`user ------ ${userId}`)
    const user = await User.findOne({ _id: userId });
    // console.log(`user ------ ${user}`)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const image = req.file;
    const imageName = req.body.ImageName;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let clearance_data = await Clearance.findOne({ userRef: user._id });

    if (clearance_data) {
      clearance_data.FormData.push({
        Transport_type: req.body.Transport_type,
        Total_expense: req.body.Total_expense,
        images: {
          data: image.buffer,
          contentType: image.mimetype,
        },
        ImageName: imageName,
        timestamp: new Date(),
      });
      await clearance_data.save();
    } else {
      clearance_data = new Clearance({
        FormData: [
          {
            Transport_type: req.body.Transport_type,
            Total_expense: req.body.Total_expense,
            images: {
              data: image.buffer,
              contentType: image.mimetype,
            },
            ImageName: imageName,
            timestamp: new Date(),
          },
        ],
        userRef: user._id,
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






router.get("/form/:id", async (req, res) => {
  console.log("hello form get ID call");

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



module.exports = router;
