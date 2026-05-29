const { Double, Schema } = require("mongoose");


const measurementSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    value: {
        type: Double,
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