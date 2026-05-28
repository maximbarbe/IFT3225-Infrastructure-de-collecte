const dotenv = require("dotenv");
const mongoose = require("mongoose");

//https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial


async function connectDB() {
    const CONNECTION = process.env.ATLAS_URI || "";
    await mongoose.connect(CONNECTION);
}

module.exports(connectDB);