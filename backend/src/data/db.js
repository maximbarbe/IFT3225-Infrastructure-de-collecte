import dotenv from "dotenv";
import mongoose from "mongoose";

// (MongoDB, s. d.)

dotenv.config()

async function connectDB() {
    const CONNECTION = process.env.ATLAS_URI || "";
    await mongoose.connect(CONNECTION,
        {dbName: "IFT3225"}
    );
}

export default connectDB;