const mongoose = require("mongoose");

const observationDbSchema = new mongoose.Schema({
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
        required: true
    }
    
});

observationDbSchema.methods.toJSON = function() {
    const observation = this.toObject();
    delete observation.__v;
    delete observation._id;
    return observation;
}

// https://stackoverflow.com/questions/74750496/overwritemodelerror-cannot-overwrite-user-model-once-compiled-at-mongoose-mo
const Observation = mongoose.models.Observation || mongoose.model("Observation", observationDbSchema);

const ObservationPostSchema = {
    type: "object",
    properties: {
        location: {
            type: "string",
            minLength: 1
        },
        proximity: {
            type: "string",
            minLength: 1
        },
        vibe: {
            type: "string",
            minLength: 1
        },
        notes: {
            type: "string"
        }
    },
    required: [
        "location",
        "proximity",
        "vibe"
    ],
    additionalProperties: false
};


module.exports = {Observation, ObservationPostSchema};