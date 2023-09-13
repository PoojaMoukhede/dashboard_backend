const express = require("express");
const router = express.Router();
const Event = require('../Model/Event')


router.get('/getevent', async (req, res) => {  
    try {
        const Event_data = await Event.find();
        res.json(Event_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
})


router.post('/addevent', async (req, res) => { 
    try {
        let Event_data = await Event.create({
            ...req.body
        });
        res.status(201).json(Event_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
   
}) 

module.exports = router;