import useApi from "../hooks/useApi";
import { getAmbiance } from "../services/ambiance";
import CustomMarker from "./CustomMarker";



export default function Location({ lat, lon, loc }) {
    // L'utilisation de React Leaflet a été faite avec la documentation (React Leaflet, s.d.)




    const {data, loading, error} = useApi(() => (getAmbiance(loc, "2160h")))
    return(<>
        {(!loading &&!error) && <CustomMarker lat={lat} lon={lon} loc={loc} clickFunction={() => navigate(`/view/${loc}`)} msg={`Classification ambiante: ${data.noiseLevel.toUpperCase()}`}/>}
        {!error &&loading && <CustomMarker lat={lat} lon={lon} loc={loc} clickFunction={() => navigate(`/view/${loc}`)} textType={"text-warning"} msg={`La classification est entrain de charger. Si ca prend trop longtemps, veuillez rafraîchir la page.`}/>}
        {error && <CustomMarker lat={lat} lon={lon} loc={loc} clickFunction={() => navigate(`/view/${loc}`)} textType={"text-danger"} msg={`Il y a eu un erreur lors du chargement de cette location. Veuillez rafraichir la page ou appuyer sur le marqueur pour en voir plus.`}/>}
        </>  
    )   
}
