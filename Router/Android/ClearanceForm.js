const express = require("express");
const router = express.Router();
const multer = require("multer");
const Clearance = require("../../Model/Android/ClearanceForm");
const format = require('date-fns/format');
const User = require("../../Model/Android/User");
const fileUpload = require('express-fileupload');
const {uploadMiddleware, validateFiles} = require("../../Middleware/Uploads")
const app = express()
const fs = require('fs');
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


router.get("/form/:id", async (req, res) => {
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

//in use for render in chart on dashboard
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

            // Calculate fuel price and add it to Total_expense
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

// in use to get total data from start to this
router.get('/current-month-totals', async (req, res) => {
  try {
    const totals = await calculateCurrentMonthTotals();
    console.log(`totals : ${totals}`)
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
    

      totals.Food += parseFloat(formData.Food) || 0;
      totals.Water += parseFloat(formData.Water) || 0;
      totals.Hotel += parseFloat(formData.Hotel) || 0;
      totals.Other_Transport += parseFloat(formData.Other_Transport) || 0;
      totals.Fuel_in_liters += parseFloat(formData.Fuel_in_liters) || 0;
    });
  });

  return totals;
};


router.get('/monthlyExpenses', async (req, res) => {
  try {
    const users = await User.find();
    const monthlyExpenses = {
      Food: {},
      Water: {},
      Hotel: {},
      Other_Transport: {},
      Fuel_in_liters: {},
      fuel_expense: {},
      total_expanse: {},
    };

    for (const user of users) {
      const Record = await Clearance.findOne({ userRef: user._id });

      if (Record) {
        Record.FormData.forEach((formData) => {
          if (formData.timestamp) {
            const date = new Date(formData.timestamp);
            const formattedMonth = format(date, 'MMMM');

            // Initialize monthly totals if not already present
            for (const category of Object.keys(monthlyExpenses)) {
              if (!monthlyExpenses[category][formattedMonth]) {
                monthlyExpenses[category][formattedMonth] = 0;
              }
            }

            // Accumulate expenses for each category
            monthlyExpenses.Food[formattedMonth] += parseFloat(formData.Food) || 0;
            monthlyExpenses.Water[formattedMonth] += parseFloat(formData.Water) || 0;
            monthlyExpenses.Hotel[formattedMonth] += parseFloat(formData.Hotel) || 0;
            monthlyExpenses.Other_Transport[formattedMonth] += parseFloat(formData.Other_Transport) || 0;
            monthlyExpenses.Fuel_in_liters[formattedMonth] += parseFloat(formData.Fuel_in_liters) || 0;
            monthlyExpenses.fuel_expense[formattedMonth] += parseFloat(formData.Fuel_in_liters) * 95 || 0;

            // Calculate total expanse for each category
            monthlyExpenses.total_expanse[formattedMonth] +=
              parseFloat(formData.Food) +
              parseFloat(formData.Water) +
              parseFloat(formData.Hotel) +
              parseFloat(formData.Other_Transport) +
              parseFloat(formData.Fuel_in_liters) * 95 || 0;
          }
        });
      }
    }

    // Format the response
    const formattedMonthlyExpenses = {};
    for (const category of Object.keys(monthlyExpenses)) {
      formattedMonthlyExpenses[category] = Object.keys(monthlyExpenses[category]).map((month) => ({
        month,
        total: monthlyExpenses[category][month],
      }));
    }

    res.status(200).json(formattedMonthlyExpenses);
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});



router.post("/uploadmultiple", uploadMiddleware, validateFiles, async (req, res) => {
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


    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let fuelInLiters = 0;

    if (transportType === "Car" || transportType === "Bike") {
      fuelInLiters = req.body.Fuel_in_liters;
    }

    const totalExpense = Food + Hotel + Water + Other_Transport + fuelInLiters *95;
    const clearance_data = await Clearance.findOne({ userRef: user._id });

    const newFormData = {
      Transport_type: transportType,
      Food: Food,
      Water: Water,
      Hotel: Hotel,
      Other_Transport: Other_Transport,
      Total_expense: totalExpense,
      Fuel_in_liters: fuelInLiters,
      ImageName: req.body.ImageName,
      timestamp: new Date(),
    };

    // Read and store image data
    const images = req.files.map(file => ({
      data: fs.readFileSync(file.path),
      contentType: file.mimetype,
    }));

    newFormData.images = images;

    if (clearance_data) {
      clearance_data.FormData.push(newFormData);
      await clearance_data.save();
    } else {
      const newClearanceData = new Clearance({
        FormData: [newFormData],
        userRef: user._id,
      });
      await newClearanceData.save();
    }

    // Remove uploaded files
    req.files.forEach(file => {
      fs.unlinkSync(file.path);
    });

    res.status(200).json({
      status: "Success",
      message: "Clearance form added successfully",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});


//single images
const storage = multer.memoryStorage();
const uploadImg = multer({storage: storage}).single('image');

router.post("/form",uploadImg, async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // const image = req.file.path;
    const image = req.file;
    const imageName = req.body.ImageName;
    const transportType = req.body.Transport_type;
    const Food = parseFloat(req.body.Food) || 0;
    const Hotel = parseFloat(req.body.Hotel) || 0;
    const Water = parseFloat(req.body.Water) || 0;
    const Other_Transport = parseFloat(req.body.Other_Transport) || 0;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }


    let fuelInLiters = 0;

    if (transportType === "Car" || transportType === "Bike") {
      fuelInLiters = req.body.Fuel_in_liters;
    }
    
    const totalExpense = Food + Hotel + Water + Other_Transport + fuelInLiters *95;
    let clearance_data = await Clearance.findOne({ userRef: user._id });
    if (clearance_data) {
      clearance_data.FormData.push({
        Transport_type: transportType,
        Food: Food,
        Water: Water,
        Hotel: Hotel,
        Other_Transport: Other_Transport,
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
            Food: Food,
            Water: Water,
            Hotel: Hotel,
            Other_Transport: Other_Transport,
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

module.exports = router;
