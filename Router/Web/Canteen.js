const express = require("express");
const router = express.Router();
const Canteen = require("../../Model/Web/Canteen");
const cron = require("node-cron");
const moment = require("moment-timezone");
const Coupon = require("../../Model/Android/Coupon");
const User = require("../../Model/Android/User");

// Create a new menu item
router.post("/menu", async (req, res) => {
  try {
    const { date, menu } = req.body;

    // Convert the input date to UTC timezone india
    const inputDateInIST = moment.tz(date, "Asia/Kolkata");
    const dateInUTC = inputDateInIST.clone().utc();

    // Check if a menu already exists for the date in UTC
    const existingMenu = await Canteen.findOne({ date: dateInUTC.toDate() });

    if (existingMenu) {
      return res
        .status(400)
        .json({ error: "Menu already exists for this date." });
    }
    const newMenu = new Canteen({ date: dateInUTC.toDate(), menu });
    await newMenu.save();

    res.status(201).json(newMenu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET route to retrieve today's and tomorrow's menu
router.get("/menu", async (req, res) => {
  try {
    // Use Kolkata time (IST)
    console.log("Get menu api call");
    const now = moment().tz("Asia/Kolkata");
    const today = now.clone().startOf("day");
    // console.log(today);
    const tomorrow = now.clone().add(1, "days").startOf("day");

    const todayMenu = await Canteen.findOne({ date: today.toDate() });
    const tomorrowMenu = await Canteen.findOne({ date: tomorrow.toDate() });

    const menuData = {
      today: todayMenu,
      tomorrow: tomorrowMenu,
    };

    res.json(menuData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// this will delete menu automaticly after midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete today's menu
    await Canteen.deleteOne({ date: today });

    // Find tomorrow's menu and update its status
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const menu = await Canteen.findOne({ date: tomorrow });

    if (menu) {
      menu.status = "available";
      await menu.save();
    }
  } catch (err) {
    console.error("Error in scheduled job:", err);
  }
});

// coupon purchesed count and post, update, delete
router.post("/menu/buy", async (req, res) => {
  console.log("Hello Menu Buy POST call");
  try {
    const { userId, numberOfCoupons, menuRef } = req.body;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let couponPurchase = await Coupon.findOne({ userRef: user._id });
    // console.log(`purchesed menu for which user : ${user}`)
    console.log(`menu referance : ${menuRef}`)


    if (couponPurchase) {
      // Check if there's a record for the default purchase date and menuRef
      const existingPurchase = couponPurchase.Coupon_Count.find(
        (purchase) => purchase.menuRef.equals(menuRef)
      );

      if (existingPurchase) {
        existingPurchase.numberOfCoupons += numberOfCoupons;
      } else {
        couponPurchase.Coupon_Count.push({
          numberOfCoupons,
          menuRef,
        });
      }

      await couponPurchase.save();
    } else {
      couponPurchase = new Coupon({
        Coupon_Count: [
          { numberOfCoupons, menuRef },
        ],
        userRef: user._id,
      });
      await couponPurchase.save();
    }

    res.status(200).json({
      status: "Success",
      message: `${numberOfCoupons} menu items purchased successfully for the default purchase date`,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

router.put("/menu/:date", async (req, res) => {
  try {
    const { date } = req.params; // 2023-09-28T18:30:00.000+00:00 like this
    const updatedMenu = req.body.menu;
    const existingMenu = await Canteen.findOne({ date: date });

    if (!existingMenu) {
      return res.status(404).json({ error: "Menu not found for this date." });
    }

    existingMenu.menu = updatedMenu;
    await existingMenu.save();

    res.status(200).json(existingMenu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/coupon-count-by-menu", async (req, res) => {
  try {
    const couponCountsByMenu = await Coupon.aggregate([
      {
        $unwind: "$Coupon_Count",
      },
      {
        $group: {
          _id: "$Coupon_Count.menuRef",
          totalCoupons: { $sum: "$Coupon_Count.numberOfCoupons" },
        },
      },
    ]);
    console.log(`count coupon ${couponCountsByMenu.totalCoupons}`);
    res.json(couponCountsByMenu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.get("/coupon-count-by-menu", async (req, res) => {
//   try {
//     const coupons = await Coupon.find(); // Assuming your model is named "Coupon"
    
//     // Create an object to store coupon counts by menu
//     const couponCountsByMenu = {};

//     // Loop through the coupons and count them by menu
//     coupons.forEach(coupon => {
//       if (coupon.Coupon_Count) {
//         coupon.Coupon_Count.forEach(couponCount => {
//           const menuRef = couponCount.menuRef;
//           const numberOfCoupons = couponCount.numberOfCoupons;
          
//           if (!couponCountsByMenu[menuRef]) {
//             couponCountsByMenu[menuRef] = 0;
//           }
//           couponCountsByMenu[menuRef] += numberOfCoupons;
//         });
//       }
//     });

//     // Convert the object into an array of objects
//     const result = Object.keys(couponCountsByMenu).map(menuRef => ({
//       menuRef,
//       totalCoupons: couponCountsByMenu[menuRef],
//     }));
    
//     console.log("Coupon count by menu:", result);
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

 async function getCouponSumByUserId(userId) {
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return 0; // Return 0 if the user is not found
    }

    const userCoupons = await Coupon.findOne({ userRef: user._id });

    let totalCoupons = 0;

    userCoupons.Coupon_Count.forEach((count) => {
      totalCoupons += count.numberOfCoupons;
    });

    return totalCoupons;
  } catch (error) {
    throw error;
  }
}

router.get("/coupon/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const sum = await getCouponSumByUserId(userId);

    res.json({ totalCoupons: sum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve coupon sum" });
  }
});


module.exports = router;
