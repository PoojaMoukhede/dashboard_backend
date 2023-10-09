// const express = require("express");
// const router = express.Router();
// const LatLong = require("../../Model/Android/LatLong");
// const jwt = require("jsonwebtoken");
// const secret = "SECRET";
// const User = require("../../Model/Android/User");

// // Both checked
// router.get("/latLong", async (req, res) => {
//   console.log("hello LatLong");
//   try {
//     const latLongRecords = await LatLong.find();

//     if (!latLongRecords) {
//       return res.status(404).json({ message: "No latLong records found" });
//     }

//     res.status(200).json({
//       status: "Success",
//       message: latLongRecords,
//     });
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//     console.log(e);
//   }
// });

// router.post("/latLong", async (req, res) => {
//   console.log("hello LatLong post call");

//   try {
//     //     const decoded = jwt.verify(req.headers.token, secret);
//     //     console.log(decoded)
//     //     const userId = decoded.User; // Assuming JWT  contains Emp_ID
//     //  console.log(`userId ------ ${userId}`)
//     // Find the user by Emp_ID to ensure it exists
//     const userId = req.body.userId;
//     const user = await User.findOne({ _id: userId });
//     console.log(`user ------ ${user}`);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     let latLong = await LatLong.findOne({ userRef: user._id });

//     if (latLong) {
//       // If latLong record exists, update it
//       latLong.Details_location.push(req.body);
//       await latLong.save();
//     } else {
//       latLong = new LatLong({
//         Details_location: [req.body],
//         userRef: user._id,
//       });
//       await latLong.save();
//     }

//     res.status(200).json({
//       status: "Success",
//       message: "latlong added successfully",
//     });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.log(e);
//   }
// });

// router.get("/latLong/:id", async (req, res) => {
//   console.log("hello LatLong get ID call");

//   try {
//     const userId = req.params.id;
//     console.log(userId)
//     const user = await User.findOne({ _id: userId });
//     console.log(`user : ${user}`)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const latLong = await LatLong.findOne({ userRef: user._id });
//     console.log(`Employee latLong : ${latLong}`)
//     if (!latLong) {
//       return res.status(404).json({ message: "latLong record not found" });
//     }
//     res.status(200).json({
//       status: "Success",
//       message: latLong,
//     });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//     console.log(e);
//   }
// });

// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const earthRadius = 6371; // Radius of the Earth in kilometers

//   // Convert latitude and longitude from degrees to radians
//   const radLat1 = (Math.PI / 180) * lat1;
//   const radLon1 = (Math.PI / 180) * lon1;
//   const radLat2 = (Math.PI / 180) * lat2;
//   const radLon2 = (Math.PI / 180) * lon2;

//   // Haversine formula
//   const dLat = radLat2 - radLat1;
//   const dLon = radLon2 - radLon1;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = earthRadius * c; // Distance in kilometers like (0.25 km)

//   return distance;
// }
// router.get("/calculate-distance/", (req, res) => {
//   //calculate-distance?lat1=52.5200&lon1=13.4050&lat2=48.8566&lon2=2.3522
//   // ${baseUrl}${endpoint}?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
//   const { lat1, lon1, lat2, lon2 } = req.query;

//   if (!lat1 || !lon1 || !lat2 || !lon2) {
//     return res
//       .status(400)
//       .json({
//         message:
//           "Invalid input. Please provide lat1, lon1, lat2, and lon2 as query parameters.",
//       });
//   }

//   const distance = calculateDistance(
//     parseFloat(lat1),
//     parseFloat(lon1),
//     parseFloat(lat2),
//     parseFloat(lon2)
//   );

//   res.json({ distance: distance.toFixed(2) });
// });
// module.exports = router;
