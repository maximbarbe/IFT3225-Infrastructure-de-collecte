import mongoose from "mongoose";

const locationDbSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lon: {
        type: Number,
        required: true
    }
});

locationDbSchema.methods.toJSON = function() {
    const location = this.toObject();
    delete location.__v;
    delete location._id;
    return location;
}

// (Ipizzinidev, 2022)
const Location = mongoose.models.Location || mongoose.model("Location", locationDbSchema);

// https://ajv.js.org/packages/ajv-errors.html#messages-for-keywords
const LocationPostSchema = {
    type: "object",
    properties: {
        location: {
            type: "string",
            minLength: 1
        },
        lat: {
            type: "number",
            format: "lat"
        },
        lon: {
            type: "number",
            format: "lon"
        }
    },
    required: [
        "location",
        "lat",
        "lon"
    ]
};




export {
    Location,
    LocationPostSchema
};