const mongooose = require('mongoose');

const adminSchema = new mongooose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

const Admin = mongooose.model('admins', adminSchema);

module.exports = Admin;