import mongoose from "mongoose";

const locationDbSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    }
});

locationDbSchema.methods.toJSON = function() {
    const location = this.toObject();
    delete location.__v;
    delete location._id;
    return location;
}

// https://stackoverflow.com/questions/74750496/overwritemodelerror-cannot-overwrite-user-model-once-compiled-at-mongoose-mo
const Location = mongoose.models.Location || mongoose.model("Location", locationDbSchema);

const LocationPostSchema = {
    type: "object",
    properties: {
        location: {
            type: "string",
            minLength: 1
        }
    },
    required: [
        "location"
    ]
};




export {
    Location,
    LocationPostSchema
};