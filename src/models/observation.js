const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    proximity: {
        type: String,
        required: true
    },
    vibe: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: false
    }
    
});