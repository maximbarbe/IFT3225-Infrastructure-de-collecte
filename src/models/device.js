const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({

    apiKey: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
    
});


deviceSchema.methods.toJSON = function() {
    const device = this.toObject();
    device.id = device._id;
    delete device.apiKey;
    delete device.__v;
    delete device._id;
    return device;
};


const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;