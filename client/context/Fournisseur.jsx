import { createContext, useState } from "react";

// Ce fichier a été tiré du cours et adapté à nos besoins: https://cours-udem-ift3225.netlify.app/guides/tuto-react-3/
const AppContext = createContext(null);

function Fournisseur( {children} ) {
    const [user, setUser] = useState(null);


    const valeur = {user, setUser};

    return (
        <AppContext.Provider value={valeur}>
            {children}
        </AppContext.Provider>
    )
}

export {
    AppContext,
    Fournisseur
}