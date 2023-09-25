const express = require("express");
const router = express.Router();
const Event = require('../../Model/Web/Event')


router.get('/event', async (req, res) => {  
    try {
        const Event_data = await Event.find();
        res.json(Event_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
})


router.post('/event', async (req, res) => { 
    try {
        let Event_data = await Event.create({
            ...req.body
        });
        res.status(201).json(Event_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
   
}) 

router.put('/event/:id',async(req,res)=>{
    try {
        const data = req.body;
        const Event_data = await Event.updateOne({ _id: req.params.id }, data);
        res.json({ result: Event_data });
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
})


router.delete("/event/:id", async (req, res) => {
    const ID = req.params.id;
    const Event_data = await Event.findOneAndDelete({ _id: ID });
    res.send("Event's data has been Deleted");
    
})


module.exports = router;