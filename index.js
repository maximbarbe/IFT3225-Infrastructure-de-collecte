const express = require("express");
const dotenv = require("dotenv");
const {MongoClient} = require("mongodb");
const measurementsRouter = require("./routes/measurements");
const observationsRouter = require("./routes/observations");
const devicesRouter = require("./routes/devices");

const app = express();
const PORT = 8383;

app.use(express.json());
app.use(measurementsRouter);
app.use(observationsRouter);
app.use(devicesRouter);

dotenv.config()

//https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial
//https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb-how-to-get-connected-to-your-database
//https://www.geeksforgeeks.org/node-js/how-to-wait-for-mongodb-connection-to-be-made-before-creating-http-server-in-node-js/

const CONNECTION = process.env.ATLAS_URI || "";
const DB_CLIENT = new MongoClient(CONNECTION);



async function main() {
    try {
        await DB_CLIENT.connect();


        app.get("/", (req, res) => {

            res.send("Hello world").status(200);
        });


        app.listen(PORT, () => {
            console.log(`Serveur lancé sur http://localhost:${PORT}`);
        });


    } catch(e) {
        console.error(e);
    } finally {
        await DB_CLIENT.close();
    }
    
}












main().catch(console.error);