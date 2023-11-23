const express = require("express");
const router = express.Router();
// const Employee = require('../../Model/Web/AddEmployee')
const User = require("../../Model/Android/User")
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' })
const CryptoJS = require('crypto-js')
const fs = require("fs").promises;
const path = require("path");



// To get/view all employees
router.get('/Users', async (req, res) => {  
    try {
        const results = await User.find();
        res.json(results);
        // console.log( "result in get" ,results )
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
})
router.get('/Users/:id', async (req, res) => {     
  const employeeId = req.params.id;
  try {
      const employee = await User.findById(employeeId);

      if (!employee) {
          return res.status(404).json({ employee: 'Employee not found' });
      }

      res.json(employee);
  } catch (e) {
      res.status(400).json({ message: e.message });
      console.error(e);
  }
}); 

router.put('/Users/:id', async (req, res) => {

  try {
      const data = req.body;
      const employee = await User.findOneAndUpdate({ _id: req.params.id }, data);
      res.json({ result: employee });

  }
  catch (e) {
      res.status(400).json({ message: e.message });
  }

});

//delete
router.delete("/Users/:id", async (req, res) => {
  const ID = req.params.id;
  const employee = await User.findOneAndDelete({ _id: ID });
  res.send("Employee's data has been Deleted");
  
})

// for importing file and save data into database
router.post('/importdata', upload.single('file'), async (req, res) => {
    try {
        console.log("inside importdata backend")
      if (!req.file) {
        console.log("No file uploaded")
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const workbook = xlsx.readFile(req.file.path);
      console.log(`Workbook : ${workbook}`)
      const sheetName = workbook.SheetNames; // Assuming data is in the first sheet
      console.log(`sheetName : ${sheetName}`)
      const importedData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log(`importedData : ${importedData}`)
  
      await User.insertMany(importedData);
      // console.log(`Employee : ${Employee}`)
      
      res.status(200).json({ message: 'Data imported successfully' });
    } catch (error) {
      console.error('Error importing data:', error);
      res.status(500).json({ message: 'Error importing data' });
    }
  });



// router.post('/importdata', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
//     const importedData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     // Decrypt the sensitive information during import
//     const decryptedData = importedData.map((item) => {
//       const decryptedItem = { ...item };

//       if (decryptedItem.email) {
//         try {
//           decryptedItem.email = CryptoJS.AES.decrypt(decryptedItem.email, 'encryptionKey').toString(CryptoJS.enc.Utf8);
//         } catch (error) {
//           console.error('Error during decryption of email:', error);
//           // Handle the decryption error for email field
//         }
//       }
//       if (decryptedItem.Emp_contact_No) {
//         try {
//           decryptedItem.Emp_contact_No = CryptoJS.AES.decrypt(decryptedItem.Emp_contact_No, 'encryptionKey').toString(CryptoJS.enc.Utf8);
//         } catch (error) {
//           console.error('Error during decryption of Emp_contact_No:', error);
//           // Handle the decryption error for Emp_contact_No field
//         }
//       }
//       if (decryptedItem._id) {
//         try {
//           decryptedItem._id = CryptoJS.AES.decrypt(decryptedItem._id, 'encryptionKey').toString(CryptoJS.enc.Utf8);
//         } catch (error) {
//           console.error('Error during decryption of _id:', error);
//           // Handle the decryption error for _id field
//         }
//       }

//       return decryptedItem;
//     });

//     // Insert the decrypted data into the database
//     await User.insertMany(decryptedData);

//     res.status(200).json({ message: 'Data imported successfully' });
//   } catch (error) {
//     console.error('Error importing data:', error);
//     res.status(500).json({ message: 'Error importing data' });
//   }
// });


  router.delete("/Users", async (req, res) => {
    const selectedUsers = req.body; // Get the array of selected email addresses
    try {
      const User_data = await User.deleteMany({ email: { $in: selectedUsers } });
      res.send("User's data has been Deleted");
    } catch (error) {
      res.status(500).send("Error deleting User data: " + error.message);
    }
  });

  const storage = multer.memoryStorage();
  const upload2 = multer({ storage: storage });
  

  router.put("/update-profile/:id", upload2.single("profileImage"), async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findOneAndUpdate( { _id: userId },
        { $set: {} }, 
        { new: true });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log(req.file);
      if (req.file) {
        const fileName = req.file.originalname;
        console.log(fileName);
        fs.writeFile(path.join("uploads2/", fileName), req.file.buffer);
  
        user.profileImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
        await user.save();
      }
  
      res.status(200).json({ message: "Profile image updated successfully", user: user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;