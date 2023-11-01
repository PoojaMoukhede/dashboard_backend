const express = require("express");
const router = express.Router();
const multer = require("multer");
const Clearance = require("../../Model/Android/ClearanceForm");
const format = require('date-fns/format');
const User = require("../../Model/Android/User");
const fileUpload = require('express-fileupload');
const uploadMiddleware = require("../../Middleware/Uploads")
const app = express()
app.use(
  fileUpload({
      limits: {
          fileSize: 10000000,
      },
      abortOnLimit: true,
  })
);

// Add this line to serve our index.html page
app.use(express.static('public'));

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

// here i am sending fuel conditional based
// router.post("/form",uploadImg, async (req, res) => {
//   console.log("Hello form post call");
//   try {
//     const userId = req.body.userId;
//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const image = req.files;
//     const imageName = req.body.ImageName;
//     const transportType = req.body.Transport_type;
//     const Food = parseFloat(req.body.Food) || 0;
//     const Hotel = parseFloat(req.body.Hotel) || 0;
//     const Water = parseFloat(req.body.Water) || 0;
//     const Other_Transport = parseFloat(req.body.Other_Transport) || 0;

//     if (!req.files) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const totalExpense = Food + Hotel + Water + Other_Transport;
//     let fuelInLiters = 0;

//     if (transportType === "Car" || transportType === "Bike") {
//       fuelInLiters = totalExpense;
//     }

//     let clearance_data = await Clearance.findOne({ userRef: user._id });

//     if (clearance_data) {
//       clearance_data.FormData.push({
//         Transport_type: transportType,
//         Food: Food,
//         Water: Water,
//         Hotel: Hotel,
//         Other_Transport: Other_Transport,
//         Total_expense: totalExpense,
//         Fuel_in_liters: fuelInLiters,
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
//             Transport_type: transportType,
//             Food: Food,
//             Water: Water,
//             Hotel: Hotel,
//             Other_Transport: Other_Transport,
//             Total_expense: totalExpense,
//             Fuel_in_liters: fuelInLiters,
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
    let totalFuelLiters = 0; // Initialize total fuel liters

    Record.FormData.forEach((formData) => {
      if (formData.Total_expense) {
        totalExpenses += parseFloat(formData.Total_expense);
      }
      if (formData.Fuel_in_liters) {
        totalFuelLiters += parseFloat(formData.Fuel_in_liters);
      }
    });

    res.status(200).json({
      status: "Success",
      message: Record,
      totalExpenses,
      totalFuelLiters, // Include total fuel liters in the response
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

// total fuel 
router.get("/totalFuel", async (req, res) => {
  console.log("hello total fuel call");
  try {
    const users = await User.find();
    let totalAllFuel = 0;

    for (const user of users) {
      const Record = await Clearance.findOne({ userRef: user._id });

      if (Record) {
        Record.FormData.forEach((formData) => {
          if (formData.Fuel_in_liters) {
            totalAllFuel += parseFloat(formData.Fuel_in_liters);
          }
        });
      }
    }

    res.status(200).json({
      status: "Success",
      totalAllFuel: totalAllFuel,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.get('/totalFuelByMonth', async (req, res) => {
  try {
    const users = await User.find();
    const totalFuelByMonth = {};

    for (const user of users) {
      const Record = await Clearance.findOne({ userRef: user._id });

      if (Record) {
        Record.FormData.forEach((formData) => {
          if (formData.Fuel_in_liters && formData.timestamp) {
            const date = new Date(formData.timestamp);
            const formattedMonth = format(date, 'MMMM'); 

            if (!totalFuelByMonth[formattedMonth]) {
              totalFuelByMonth[formattedMonth] = 0;
            }
            totalFuelByMonth[formattedMonth] += parseFloat(formData.Fuel_in_liters);
          }
        });
      }
    }

    const monthlyExpensesOnFuel = Object.keys(totalFuelByMonth).map(month => ({
      month,
      liters: totalFuelByMonth[month],
    }));

    res.status(200).json(monthlyExpensesOnFuel);
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});

router.get('/current-month-totals', async (req, res) => {
  try {
    const totals = await calculateCurrentMonthTotals();
    // console.log(`totals : ${totals}`)
    res.json(totals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const calculateCurrentMonthTotals = async () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed, so add 1

  // Query documents with a timestamp within the current month and year
  const currentMonthClearances = await Clearance.find({
    "FormData.timestamp": {
      $gte: new Date(currentYear, currentMonth - 1, 1), // Start of current month
      $lt: new Date(currentYear, currentMonth, 1), // Start of next month
    },
  });

  // Calculate totals for each field
  const totals = {
    Transport_type: {},
    Total_expense: 0,
    Fuel_in_liters: 0,
    Food: 0,
    Water: 0,
    Hotel: 0,
    Other_Transport: 0,
  };

  currentMonthClearances.forEach((clearance) => {
    clearance.FormData.forEach((formData) => {
      totals.Transport_type[formData.Transport_type] =
        (totals.Transport_type[formData.Transport_type] || 0) + 1;
      totals.Total_expense += parseFloat(formData.Total_expense) || 0;
      totals.Fuel_in_liters += parseFloat(formData.Fuel_in_liters) || 0;
      totals.Food += parseFloat(formData.Food) || 0;
      totals.Water += parseFloat(formData.Water) || 0;
      totals.Hotel += parseFloat(formData.Hotel) || 0;
      totals.Other_Transport += parseFloat(formData.Other_Transport) || 0;
    });
  });

  return totals;
};

//multiple images 
// router.post("/form",uploadMiddleware, async (req, res) => {
//   console.log("Hello form post call");
//   try {
//     const userId = req.body.userId;
//     const user = await User.findOne({ _id: userId });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const files = req.files;
//     const imageName = req.body.ImageName;
//     const transportType = req.body.Transport_type;
//     const Food = parseFloat(req.body.Food) || 0;
//     const Hotel = parseFloat(req.body.Hotel) || 0;
//     const Water = parseFloat(req.body.Water) || 0;
//     const Other_Transport = parseFloat(req.body.Other_Transport) || 0;
//     if (!req.files) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     const totalExpense = Food + Hotel + Water + Other_Transport;
//     let fuelInLiters = 0;
//     if (transportType === "Car" || transportType === "Bike") {
//       fuelInLiters = req.body.Fuel_in_liters;
//     }
//     let clearance_data = await Clearance.findOne({ userRef: user._id });
//     if (clearance_data) {
//       clearance_data.FormData.push({
//         Transport_type: transportType,
//         Food: Food,
//         Water: Water,
//         Hotel: Hotel,
//         Other_Transport: Other_Transport,
//         Total_expense: totalExpense,
//         Fuel_in_liters: fuelInLiters,
//         images: {
//           data: files.buffer,
//           contentType: files.mimetype,
//         },
//         ImageName: imageName,
//         timestamp: new Date(),
//       });
//       await clearance_data.save();
//     } else {
//       clearance_data = new Clearance({
//         FormData: [
//           {
//             Transport_type: transportType,
//             Food: Food,
//             Water: Water,
//             Hotel: Hotel,
//             Other_Transport: Other_Transport,
//             Total_expense: totalExpense,
//             Fuel_in_liters: fuelInLiters,
//             images: {
//               data: files.buffer,
//               contentType: files.mimetype,
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



//single images
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadImg = multer({storage: storage}).single('image');

// router.post("/form",uploadImg, async (req, res) => {
//   console.log("Hello form post call");
//   try {
//     const userId = req.body.userId;
//     const user = await User.findOne({ _id: userId });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // const image = req.file.path;
//     const image = req.file;
//     const imageName = req.body.ImageName;
//     const transportType = req.body.Transport_type;
//     const Food = parseFloat(req.body.Food) || 0;
//     const Hotel = parseFloat(req.body.Hotel) || 0;
//     const Water = parseFloat(req.body.Water) || 0;
//     const Other_Transport = parseFloat(req.body.Other_Transport) || 0;
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     const totalExpense = Food + Hotel + Water + Other_Transport;
//     let fuelInLiters = 0;
//     if (transportType === "Car" || transportType === "Bike") {
//       fuelInLiters = req.body.Fuel_in_liters;
//     }
//     let clearance_data = await Clearance.findOne({ userRef: user._id });
//     if (clearance_data) {
//       clearance_data.FormData.push({
//         Transport_type: transportType,
//         Food: Food,
//         Water: Water,
//         Hotel: Hotel,
//         Other_Transport: Other_Transport,
//         Total_expense: totalExpense,
//         Fuel_in_liters: fuelInLiters,
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
//             Transport_type: transportType,
//             Food: Food,
//             Water: Water,
//             Hotel: Hotel,
//             Other_Transport: Other_Transport,
//             Total_expense: totalExpense,
//             Fuel_in_liters: fuelInLiters,
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

router.post("/form", uploadImg, async (req, res) => {
  console.log("Hello form post call");
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transportType = req.body.Transport_type;
    const Food = parseFloat(req.body.Food) || 0;
    const Hotel = parseFloat(req.body.Hotel) || 0;
    const Water = parseFloat(req.body.Water) || 0;
    const Other_Transport = parseFloat(req.body.Other_Transport) || 0;
    const imageName = req.body.ImageName;

    const formData = {
      Transport_type: transportType,
      Food: Food,
      Water: Water,
      Hotel: Hotel,
      Other_Transport: Other_Transport,
      Total_expense: Food + Hotel + Water + Other_Transport,
      timestamp: new Date(),
    };

    if (transportType === "Car" || transportType === "Bike") {
      formData.Fuel_in_liters = req.body.Fuel_in_liters;
    }

    if (req.file) {
      formData.images = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      formData.ImageName = imageName;
    }
console.log(` req.file : ${req.file}`)
    let clearance_data = await Clearance.findOne({ userRef: user._id });
    if (clearance_data) {
      clearance_data.FormData.push(formData);
    } else {
      clearance_data = new Clearance({
        FormData: [formData],
        userRef: user._id,
      });
    }

    await clearance_data.save();

    res.status(200).json({
      status: "Success",
      message: "Clearance form added successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.post("/update-profile-image/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      user.profileImage = req.file.filename;
      await user.save();
    }

    res.status(200).json({ message: "Profile image updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
