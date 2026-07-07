import mongoose from "mongoose";

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
    },
    userId: {
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

// (Ipizzinidev, 2022)
const Device = mongoose.models.Device || mongoose.model('Device', deviceDbSchema);



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
        },
        userId: {
            type: "string",
            minLength: 1
        }
    },
    required: [
        "name",
        "location",
        "userId"
    ],
    additionalProperties: false
};





export {Device,  DevicePostSchema};
