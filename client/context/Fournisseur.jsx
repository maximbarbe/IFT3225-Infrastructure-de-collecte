import { createContext, useContext, useState } from "react";

// https://cours-udem-ift3225.netlify.app/guides/tuto-react-3/
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