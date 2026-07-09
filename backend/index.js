import app from "./src/app.js";






const PORT = process.env.PORT || 8383;



app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
});


