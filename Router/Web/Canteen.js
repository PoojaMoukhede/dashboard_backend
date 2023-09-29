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
  
      // Convert the input date to UTC timezone india
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


// coupon purchesed count and post, update, delete
  // router.post('/menu/buy', async (req, res) => {
  //   console.log("Hello Menu Buy POST call");
  
  //   try {
  //     const { userId, numberOfCoupons } = req.body;
  //     const user = await User.findOne({ _id: userId }); //user id is mongo id
  
  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }
  
  //     let couponPurchase = await Coupon.findOne({ userRef: user._id });
  //     if (couponPurchase) {
  //       couponPurchase.Coupon_Count.push({ numberOfCoupons });
  //       await couponPurchase.save();
  //     } else {
  //       couponPurchase = new Coupon({
  //         Coupon_Count: [{ numberOfCoupons }],
  //         userRef: user._id, 
  //       });
  //       await couponPurchase.save();
  //     }
  
  //     res.status(200).json({
  //       status: "Success",
  //       message: `${numberOfCoupons} menu items purchased successfully`,
  //     });
  //   } catch (e) {
  //     res.status(400).json({ message: e.message });
  //     console.log(e);
  //   }
  // });

// router.post('/menu/buy', async (req, res) => {
//     console.log("Hello Menu Buy POST call");
  
//     try {
//       const { userId, numberOfCoupons, purchaseDate } = req.body;
//       const user = await User.findOne({ _id: userId }); // user id is a MongoDB ObjectId
  
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       // Get the current date
//       // const purchaseDate = new Date();
  
//       let couponPurchase = await Coupon.findOne({ userRef: user._id });
  
//       if (couponPurchase) {
//         // Check if there's a record for the current date
//         const existingPurchase = couponPurchase.Coupon_Count.find(
//           (purchase) => purchase.date === purchaseDate
//         );
  
//         if (existingPurchase) {
//           existingPurchase.numberOfCoupons += numberOfCoupons;
//         } else {
//           couponPurchase.Coupon_Count.push({
//             date: purchaseDate,
//             numberOfCoupons,
//           });
//         }
  
//         await couponPurchase.save();
//       } else {
//         couponPurchase = new Coupon({
//           Coupon_Count: [{ date: purchaseDate, numberOfCoupons }],
//           userRef: user._id,
//         });
//         await couponPurchase.save();
//       }
  
//       res.status(200).json({
//         status: "Success",
//         message: `${numberOfCoupons} menu items purchased successfully`,
//       });
//     } catch (e) {
//       res.status(400).json({ message: e.message });
//       console.log(e);
//     }
// });
  
router.post('/menu/buy', async (req, res) => {
  console.log("Hello Menu Buy POST call");
  
  try {
    const { userId, numberOfCoupons, purchaseDate } = req.body;
    const user = await User.findOne({ _id: userId }); // user id is a MongoDB ObjectId

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse the purchaseDate as a Date object
    const parsedPurchaseDate = new Date(purchaseDate);

    let couponPurchase = await Coupon.findOne({ userRef: user._id });

    if (couponPurchase) {
      // Check if there's a record for the parsed purchase date
      const existingPurchase = couponPurchase.Coupon_Count.find(
        (purchase) => purchase.purchaseDate === parsedPurchaseDate
      );

      if (existingPurchase) {
        existingPurchase.numberOfCoupons += numberOfCoupons;
      } else {
        couponPurchase.Coupon_Count.push({
          purchaseDate: parsedPurchaseDate,
          numberOfCoupons,
        });
      }

      await couponPurchase.save();
    } else {
      couponPurchase = new Coupon({
        Coupon_Count: [{ date: parsedPurchaseDate, numberOfCoupons }],
        userRef: user._id,
      });
      await couponPurchase.save();
    }

    res.status(200).json({
      status: "Success",
      message: `${numberOfCoupons} menu items purchased successfully for ${parsedPurchaseDate}`,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
});

  
  //----------
  // router.get('/menu/total_coupon_count', async (req, res) => {
  //   try {
  //     const coupons = await Coupon.find();
  //       let totalCouponCount = 0;
  //     coupons.forEach((coupon) => {
  //       totalCouponCount += coupon.Coupon_Count.reduce((sum, item) => sum + item.numberOfCoupons, 0);
  //     });
  
  //     res.json({ totalCouponCount });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // });
  //----------

// undefine : count (2)
  // router.get('/menu/total_coupon_count', async (req, res) => {
  //   try {
  //     const coupons = await Coupon.find();
  //     const couponCountsByDate = {};
  
  //     coupons.forEach((coupon) => {
  //       coupon.Coupon_Count.forEach((purchase) => {
  //         const dateString = purchase.date
  
  //         if (!couponCountsByDate[dateString]) {
  //           couponCountsByDate[dateString] = 0;
  //         }
  
  //         couponCountsByDate[dateString] += purchase.numberOfCoupons;
  //       });
  //     });
  
  //     res.json(couponCountsByDate);
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // });
  
  router.get('/menu/total_coupon_count', async (req, res) => {
    try {
      
      const now = moment().tz('Asia/Kolkata');
      const today = now.clone().startOf('day');
   
      const canteen = await Canteen.findOne({ date: today });
      const coupons = await Coupon.find({});
      // const coupons = await Coupon.find({date:"2023-09-28T18:30:00.000+00:00"});

      if (!canteen) {
        return res.status(404).json({ error: 'Canteen item not found' });
      }
  
      const canteenDate = formatDate(canteen.date); 
      // const canteenDate = canteen.date.toLocaleDateString()
      console.log(`canteenDate : ${canteenDate}`);
  
      const couponCountsByDate = {};
      console.log(`coupon : ${coupons}`)
      coupons.forEach((coupon) => {
        coupon.Coupon_Count.forEach((purchase) => {
          const purchaseDate = formatDate(purchase.date); 
          // const purchaseDate = purchase.date.toLocaleDateString(); 

          console.log(`purchaseDate : ${purchaseDate}`);
  
          if (purchaseDate === canteenDate) {
            if (!couponCountsByDate[purchaseDate]) {
              couponCountsByDate[purchaseDate] = 0;
            }
  
            couponCountsByDate[purchaseDate] += purchase.numberOfCoupons;
          }
        });
      });
  
      res.json(couponCountsByDate);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  //function to format a date as "YYYY-MM-DD"
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  
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