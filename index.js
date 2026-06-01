const express = require("express");
const measurementsRouter = require("./src/routes/measurements");
const observationsRouter = require("./src/routes/observations");
const devicesRouter = require("./src/routes/devices");
const {connectDB} = require("./db")


const app = express();
const PORT = 8383;

app.use(express.json());
app.use(measurementsRouter);
app.use(observationsRouter);
app.use(devicesRouter);



connectDB().catch(err => console.log(err));

app.use((req, res) => {
    return res.status(404).json({
        error: "La ressource demandée n'existe pas!",
        details: []
    })
})

app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
});


