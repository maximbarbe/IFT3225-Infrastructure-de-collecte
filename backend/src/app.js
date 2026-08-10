import express from "express";
import cors from "cors";
import measurementsRouter from "./routes/measurements.js";
import observationsRouter from "./routes/observations.js";
import devicesRouter from "./routes/devices.js";
import locationsRouter from "./routes/locations.js";
import ambianceRouter from "./routes/ambiance.js";
import connectDB from "./data/db.js";
import userRouter from "./routes/users.js";
import redisClient from "./services/redisConnect.js";
const app = express();


//https://medium.com/@valentinemaillard1/implementing-cors-in-your-node-express-app-1bdffc4eaa48
// https://expressjs.com/fr/resources/middleware/cors/
app.use(cors({
  origin: ["http://localhost:5173", "https://frontend-ae5x.onrender.com"],
  credentials: true
}));


app.use(express.json());



app.use("/measurements", measurementsRouter);
app.use("/observations", observationsRouter);
app.use("/devices", devicesRouter);
app.use("/locations", locationsRouter);
app.use("/ambiance", ambianceRouter);
app.use("/users", userRouter);

try {
    await connectDB();
} catch (e) {
    throw new Error(`Erreur lors de la connection MongoDB: ${e}`);
}

try {
    await redisClient.connect();
} catch (e) {
    throw new Error(`Erreur lors de la connection à Redis: ${e}`);
}

app.use((req, res) => {
    return res.status(404).json({
        error: "NOT_FOUND",
        message: "La ressource demandée n'existe pas!"
    })
})




export default app;
