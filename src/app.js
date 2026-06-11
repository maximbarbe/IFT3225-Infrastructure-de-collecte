import express from "express";

import measurementsRouter from "./routes/measurements.js";
import observationsRouter from "./routes/observations.js";
import devicesRouter from "./routes/devices.js";
import locationsRouter from "./routes/locations.js";
import ambianceRouter from "./routes/ambiance.js";
import connectDB from "../db.js";

const app = express();
app.use(express.json());


app.use(measurementsRouter);
app.use(observationsRouter);
app.use(devicesRouter);
app.use(locationsRouter);
app.use(ambianceRouter);

try {
    await connectDB();
} catch (e) {
    throw new Error(`Erreur lors de la connection MongoDB: ${e}`);
}

app.use((req, res) => {
    return res.status(404).json({
        error: "La ressource demandée n'existe pas!",
        details: []
    })
})

export default app;