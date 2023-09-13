const mongooose = require('mongoose');

const EventSchema = new mongooose.Schema({
    title:{ type: String},
    date: { type: String},
    // time: { type: String},
})

const Event = mongooose.model('Events', EventSchema);

module.exports = Event;