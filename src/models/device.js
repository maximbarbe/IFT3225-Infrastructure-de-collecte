const mongoose = require("mongoose");

const deviceDbSchema = new mongoose.Schema({

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


deviceDbSchema.methods.toJSON = function() {
    const device = this.toObject();
    device.id = device._id;
    delete device.apiKey;
    delete device.__v;
    delete device._id;
    return device;
};


const Device = mongoose.model('Device', deviceDbSchema);



const DevicePostSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1
        },
        location: {
            type: "string",
            minLength: 1
        }
    },
    required: [
        "name",
        "location"
    ],
    additionalProperties: false
};





module.exports = {Device,  DevicePostSchema};