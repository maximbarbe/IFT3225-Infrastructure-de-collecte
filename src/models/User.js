import mongoose from "mongoose";

const userDbSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
    

});


userDbSchema.methods.toJSON = function() {
    const user = this.toObject();
    user.id = user._id;
    delete user.__v;
    delete user._id;
    return user;
};

// (Ipizzinidev, 2022)
const User = mongoose.models.User || mongoose.model('User', userDbSchema);



const UserPostSchema = {
    type: "object",
    properties: {
        firstName: {
            type: "string",
            minLength: 1
        },
        lastName: {
            type: "string",
            minLength: 1
        },
        email: {
            type: "email",
        },
        password: {
            type: "string",
            minLength: 1
        }
    },
    required: [
        "firstName",
        "lastName",
        "email",
        "password"
    ],
    additionalProperties: false
};





export {User,  UserPostSchema};