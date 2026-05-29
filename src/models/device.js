const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
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