const express = require("express");
const router = express.Router();
const Canteen = require('../../Model/Web/Canteen')
const cron = require('node-cron');
const moment = require('moment-timezone');
const Coupon = require("../../Model/Android/Coupon")
const User = require("../../Model/Android/User")

// Create a new menu item
router.post('/menu', async (req, res) => {
    try {
      const { date, menu } = req.body;
  
      // Convert the input date to UTC
      const inputDateInIST = moment.tz(date, 'Asia/Kolkata');
      const dateInUTC = inputDateInIST.clone().utc();
  
      // Check if a menu already exists for the date in UTC
      const existingMenu = await Canteen.findOne({ date: dateInUTC.toDate() });
  
      if (existingMenu) {
        return res.status(400).json({ error: 'Menu already exists for this date.' });
      }
      const newMenu = new Canteen({ date: dateInUTC.toDate(), menu });
      await newMenu.save();
  
      res.status(201).json(newMenu);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }

});

// GET route to retrieve today's and tomorrow's menu
router.get('/menu', async (req, res) => {
  try {
    // Use Kolkata time (IST)
    console.log("Get menu api call")
    const now = moment().tz('Asia/Kolkata');
    const today = now.clone().startOf('day');
    const tomorrow = now.clone().add(1, 'days').startOf('day');

    const todayMenu = await Canteen.findOne({ date: today.toDate() });
    const tomorrowMenu = await Canteen.findOne({ date: tomorrow.toDate() });

    const menuData = {
      today: todayMenu,
      tomorrow: tomorrowMenu,
    };

    res.json(menuData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get('/menu/today', async (req, res) => {
//   try {
//     // Set the timezone to Kolkata (IST)
//     const today = moment().tz('Asia/Kolkata').startOf('day');

//     console.log('Today in Kolkata:', today.format());

//     const menu = await Canteen.findOne({ date: today.toDate() });

//     console.log('Menu from DB:', menu);

//     if (!menu) {
//       return res.status(404).json({ error: "Today's menu not found." });
//     }

//     res.json(menu);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


  // this will delete menu automaticly after midnight
  cron.schedule('0 0 * * *', async () => {
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
        menu.status = 'available';
        await menu.save();
      }
    } catch (err) {
      console.error('Error in scheduled job:', err);
    }
  });


// coupon purched count and post , update, delete
  router.post('/menu/buy', async (req, res) => {
    console.log("Hello Menu Buy POST call");
  
    try {
      const { userId, numberOfCoupons } = req.body;
      const user = await User.findOne({ _id: userId }); //user id is mongo id
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      let couponPurchase = await Coupon.findOne({ userRef: user._id });
      if (couponPurchase) {
        couponPurchase.Coupon_Count.push({ numberOfCoupons });
        await couponPurchase.save();
      } else {
        couponPurchase = new Coupon({
          Coupon_Count: [{ numberOfCoupons }],
          userRef: user._id, 
        });
        await couponPurchase.save();
      }
  
      res.status(200).json({
        status: "Success",
        message: `${numberOfCoupons} menu items purchased successfully`,
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
      console.log(e);
    }
  });
  

  router.get('/menu/total_coupon_count', async (req, res) => {
    try {
      const coupons = await Coupon.find();
        let totalCouponCount = 0;
      coupons.forEach((coupon) => {
        totalCouponCount += coupon.Coupon_Count.reduce((sum, item) => sum + item.numberOfCoupons, 0);
      });
  
      res.json({ totalCouponCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  router.put('/menu/:date', async (req, res) => {
    try {
      const { date } = req.params;  // 2023-09-28T18:30:00.000+00:00 like this
      const updatedMenu = req.body.menu; 
      const existingMenu = await Canteen.findOne({ date: date });

      if (!existingMenu) {
        return res.status(404).json({ error: 'Menu not found for this date.' });
      }
  
      existingMenu.menu = updatedMenu;
      await existingMenu.save();
  
      res.status(200).json(existingMenu);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


module.exports = router;