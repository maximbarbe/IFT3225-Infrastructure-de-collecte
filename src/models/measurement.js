const mongoose = require("mongoose");


const measurementDbSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
    
});

const Measurement = mongoose.model('Measurement', measurementDbSchema);

const MeasurementPostSchema = {
    type: "object",
    properties : {
        type: {
            type: "string",
            minLength: 1
        },
        value: {
            type: "number"
        },
        location: {
            type: "string",
            minLength: 1
        },
        timestamp: {
            type: "string",
            format: "timestamp"
        }
    },
    required: [
        "type",
        "value",
        "location",
        "timestamp"
    ]
}


module.exports = {Measurement, MeasurementPostSchema};