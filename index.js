const express = require("express");
const {MongoClient} = require("mongodb");
const measurementsRouter = require("./src/routes/measurements");
const observationsRouter = require("./src/routes/observations");
const devicesRouter = require("./src/routes/devices");
const connectDB = require("./db")


const app = express();
const PORT = 8383;

app.use(express.json());
app.use(measurementsRouter);
app.use(observationsRouter);
app.use(devicesRouter);



connectDB().catch(err => console.log(err));



app.listen(port, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
});


