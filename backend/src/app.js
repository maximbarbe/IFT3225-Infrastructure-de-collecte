import express from "express";

import measurementsRouter from "./routes/measurements.js";
import observationsRouter from "./routes/observations.js";
import devicesRouter from "./routes/devices.js";
import locationsRouter from "./routes/locations.js";
import ambianceRouter from "./routes/ambiance.js";
import connectDB from "./data/db.js";
import usersRouter from "./routes/users.js";

const app = express();
app.use(express.json());


app.use("/measurements", measurementsRouter);
app.use("/observations", observationsRouter);
app.use("/devices", devicesRouter);
app.use("/locations", locationsRouter);
app.use("/ambiance", ambianceRouter);
app.use("/users", usersRouter);

try {
    await connectDB();
} catch (e) {
    throw new Error(`Erreur lors de la connection MongoDB: ${e}`);
}

app.use((req, res) => {
    return res.status(404).json({
        error: "NOT_FOUND",
        message: "La ressource demandée n'existe pas!"
    })
})




export default app;
