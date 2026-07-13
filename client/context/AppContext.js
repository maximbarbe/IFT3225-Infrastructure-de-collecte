import { useContext } from "react";
import { AppContext } from "./Fournisseur";

// https://cours-udem-ift3225.netlify.app/guides/tuto-react-3/
export function useAppContext() {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("Le context n'est pas utilisé")
    }
    return context;
}