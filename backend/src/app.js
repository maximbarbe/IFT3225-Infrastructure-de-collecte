import express from "express";
import cors from "cors";
import measurementsRouter from "./routes/measurements.js";
import observationsRouter from "./routes/observations.js";
import devicesRouter from "./routes/devices.js";
import locationsRouter from "./routes/locations.js";
import ambianceRouter from "./routes/ambiance.js";
import connectDB from "./data/db.js";
import userRouter from "./routes/users.js";
import { initCache, cacheBackend } from "./cache/index.js";

const app = express();

// ETag faible sur les reponses JSON: quand le contenu n'a pas change, le
// navigateur recoit un 304 vide au lieu de retelecharger la charge utile.
app.set("etag", "weak");


//https://medium.com/@valentinemaillard1/implementing-cors-in-your-node-express-app-1bdffc4eaa48
// https://expressjs.com/fr/resources/middleware/cors/
app.use(cors({
  origin: ["http://localhost:5173/", "https://frontend-ae5x.onrender.com/"],
  credentials: true
}));


app.use(express.json());

// Politique par defaut: rien n'est cacheable tant qu'une route ne dit pas le
// contraire. Les routes publiques remplacent cet en-tete via cacheResponse().
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});


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

// Le cache est optionnel: si Redis est injoignable, initCache retombe sur un
// cache memoire et l'API demarre quand meme.
await initCache();
console.log(`[cache] Backend actif: ${cacheBackend()}`);

app.use((req, res) => {
    return res.status(404).json({
        error: "NOT_FOUND",
        message: "La ressource demandée n'existe pas!"
    })
})




export default app;
