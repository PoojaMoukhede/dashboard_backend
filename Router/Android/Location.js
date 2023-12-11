const express = require("express");
const router = express.Router();
const Location = require("../../Model/Android/Location")
const User = require("../../Model/Android/User")


router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.get("/location", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    // Find locations for today
    const locations = await Location.find({
      "Location_info.timestamp": {
        $gte:today,
      },
    })

    .populate("userRef")
      .exec();

    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



router.get("/location/:id", async (req, res) => {
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