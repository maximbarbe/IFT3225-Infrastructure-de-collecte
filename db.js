const dotenv = require("dotenv");
const mongoose = require("mongoose");

//https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial

dotenv.config()

async function connectDB() {
    const CONNECTION = process.env.ATLAS_URI || "";
    await mongoose.connect(CONNECTION,
        {dbName: "IFT3225"}
    );
}

module.exports = {connectDB};