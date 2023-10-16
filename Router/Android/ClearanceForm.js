const express = require("express");
const router = express.Router();
const multer = require("multer");
const Clearance = require("../../Model/Android/ClearanceForm");
const jwt = require("jsonwebtoken");
const secret = "SECRET";
const format = require('date-fns/format');
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

// working 
// router.post("/form", upload.single("image"), async (req, res) => {
//   console.log("Hello form post call");
//   try {
//     const userId = req.body.userId;
//     // console.log(`user ------ ${userId}`)
//     const user = await User.findOne({ _id: userId });
//     // console.log(`user ------ ${user}`)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const image = req.file;
//     const imageName = req.body.ImageName;

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     let clearance_data = await Clearance.findOne({ userRef: user._id });

//     if (clearance_data) {
//       clearance_data.FormData.push({
//         Transport_type: req.body.Transport_type,
//         Total_expense: req.body.Total_expense,
//         images: {
//           data: image.buffer,
//           contentType: image.mimetype,
//         },
//         ImageName: imageName,
//         timestamp: new Date(),
//       });
//       await clearance_data.save();
//     } else {
//       clearance_data = new Clearance({
//         FormData: [
//           {
//             Transport_type: req.body.Transport_type,
//             Total_expense: req.body.Total_expense,
//             images: {
//               data: image.buffer,
//               contentType: image.mimetype,
//             },
//             ImageName: imageName,
//             timestamp: new Date(),
//           },
//         ],
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


// here i am sending fuel conditional based

router.post("/form", upload.single("image"), async (req, res) => {
  console.log("Hello form post call");
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const image = req.file;
    const imageName = req.body.ImageName;
    const transportType = req.body.Transport_type;
    const totalExpense = req.body.Total_expense;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let fuelInLiters = 0; 

    if (transportType === "Car" || transportType === "Bike") {
      fuelInLiters = totalExpense;
    }

    let clearance_data = await Clearance.findOne({ userRef: user._id });

    if (clearance_data) {
      clearance_data.FormData.push({
        Transport_type: transportType,
        Total_expense: totalExpense,
        Fuel_in_liters: fuelInLiters, 
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
            Transport_type: transportType,
            Total_expense: totalExpense,
            Fuel_in_liters: fuelInLiters, 
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
    let totalExpenses = 0;
    Record.FormData.forEach((formData) => {
      if (formData.Total_expense) {
        totalExpenses += parseFloat(formData.Total_expense);
      }
    });
    res.status(200).json({
      status: "Success",
      message: Record ,totalExpenses,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.get("/totalExpenses", async (req, res) => {
  console.log("hello total expenses call");
  try {
    const users = await User.find();
    let totalAllExpenses = 0;

    for (const user of users) {
      const Record = await Clearance.findOne({ userRef: user._id });

      if (Record) {
        Record.FormData.forEach((formData) => {
          if (formData.Total_expense) {
            totalAllExpenses += parseFloat(formData.Total_expense);
          }
        });
      }
    }

    res.status(200).json({
      status: "Success",
      totalExpenses: totalAllExpenses,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


router.get('/totalMonthlyExpenses', async (req, res) => {
  try {
    const users = await User.find();
    const totalExpensesByMonth = {};

    for (const user of users) {
      const Record = await Clearance.findOne({ userRef: user._id });

      if (Record) {
        Record.FormData.forEach((formData) => {
          if (formData.Total_expense && formData.timestamp) {
            const date = new Date(formData.timestamp);
            const formattedMonth = format(date, 'MMMM'); 

            if (!totalExpensesByMonth[formattedMonth]) {
              totalExpensesByMonth[formattedMonth] = 0;
            }
            totalExpensesByMonth[formattedMonth] += parseFloat(formData.Total_expense);
          }
        });
      }
    }

    const monthlyExpenses = Object.keys(totalExpensesByMonth).map(month => ({
      month,
      expenses: totalExpensesByMonth[month],
    }));

    res.status(200).json(monthlyExpenses);
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});



module.exports = router;
