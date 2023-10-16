const express = require("express");
const router = express.Router();
const Location = require("../../Model/Android/Location")
const jwt = require("jsonwebtoken")
const secret ="SECRET"
const User = require("../../Model/Android/User")


router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Both Checked
// router.get('/getlocation', async (req, res) => {  
//   console.log("hello Location get call")
//     if (req.headers.token !== null) {
//         jwt.verify(req.headers.token, secret, (err, user) => {
//           if (err) console.log(err.message);
//           else req.user = user.data;
//         });
//         try {
//           const data = await Location.find({ userRef: req.user });
//           res.status(200).json({
//             status: "Sucess",
//             message: data,
//           });
//         } catch (error) {
//           res.status(500).json({
//             status: "Failed",
//             message: error.message,
//           });
//         }
//       } else {
//         res.status(500).json({
//           status: "Failed",
//           message: "Please Refresh the Page",
//         });
//       }
    
   
// })
router.get('/location', async (req, res) => {
  try {
    // Find all location records in the Location collection
    const locations = await Location.find({});

    // Map the results to extract location data
    const locationData = locations.map(location => ({
      userId: location.userRef,
      locationInfo: location.Location_info
    }));

    res.status(200).json(locationData);
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/location/:id", async (req, res) => {
  console.log("hello Location get id call")
  try {
    const empId = req.params.id;
    const user = await User.findOne({ _id: empId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const location = await Location.findOne({ userRef: user._id });

    if (!location) {
      return res.status(404).json({ message: "Location record not found" });
    }
    res.status(200).json({
      status: "Success",
      message: location,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.log(e);
  }
 
});


router.get('/total-distance', async(req, res) => {
  const locations = await Location.find({});
  const locationData = locations.map(location => ({
    userId: location.userRef,
    locationInfo: location.Location_info
  }));

  let totalDistance = 0;
  locationData.forEach(user => {
    user.locationInfo.forEach(location => {
      if (location.distance) {
        totalDistance += parseFloat(location.distance);
      }
    });
  });
  
  res.status(200).json({ totalDistance: totalDistance.toFixed(2) });
});


router.post("/location/:id", async (req, res) => {
  console.log("pOST CALL LOCATION")
  try {
    
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { startPoint, endPoint } = req.body;
    const distance = calculateDistance(
      startPoint.startLatitude,
      startPoint.startLongitude,
      endPoint.endLatitude,
      endPoint.endLongitude
    );

    const locationData = {
      startPoint: {
        startPointname: startPoint.startPointname,
        startLatitude: startPoint.startLatitude,
        startLongitude: startPoint.startLongitude,
      },
      endPoint: {
        endPointname: endPoint.endPointname,
        endLatitude: endPoint.endLatitude,
        endLongitude: endPoint.endLongitude,
      },
      timestamp: new Date(),
      distance: distance.toFixed(2), 
    };

    let location = await Location.findOne({ userRef: user._id });

    if (location) {
      
      location.Location_info.push(locationData);
    } else {
   
      location = new Location({
        Location_info: [locationData],
        userRef: user._id,
      });
    }


    await location.save();

    res.status(200).json({
      status: "Success",
      message: locationData, 
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
    console.error(e);
  }
});


function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude values from degrees to radians
  const radiansLat1 = (Math.PI / 180) * parseFloat(lat1);
  const radiansLon1 = (Math.PI / 180) * parseFloat(lon1);
  const radiansLat2 = (Math.PI / 180) * parseFloat(lat2);
  const radiansLon2 = (Math.PI / 180) * parseFloat(lon2);

  // Calculate the differences in latitude and longitude
  const deltaLat = radiansLat2 - radiansLat1;
  const deltaLon = radiansLon2 - radiansLon1;

  // Use the Haversine formula to calculate the distance
  const earthRadius = 6371; // Earth's radius in kilometers
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radiansLat1) *
      Math.cos(radiansLat2) *
      Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c; // Distance in kilometers

  return distance; // Return the distance
}


module.exports= router