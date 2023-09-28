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
      const existingMenu = await Canteen.findOne({ date: date });
      if (existingMenu) {
        return res.status(400).json({ error: 'Menu already exists for this date.' });
      }
      // Create a new menu entry
      const newMenu = new Canteen({ date, menu });
      await newMenu.save();
  
      res.status(201).json(newMenu);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get today's menu
  router.get('/menu', async (req, res) => {
    try {
      const today = moment().tz('Asia/Kolkata').startOf('day');
      const tomorrow = today.clone().add(1, 'days'); // Get the date for tomorrow
  
    //   console.log('Today in Kolkata:', today.format());
    //   console.log('Tomorrow in Kolkata:', tomorrow.format());
  
      // Find today's menu
      const todayMenu = await Canteen.findOne({ date: today.toDate() });
      // Find tomorrow's menu
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


// coupon purched count and post
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
  

  router.get('/menu/total-coupon-count', async (req, res) => {
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




module.exports = router;