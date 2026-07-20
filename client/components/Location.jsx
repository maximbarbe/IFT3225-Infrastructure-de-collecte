import { Marker, Popup } from "react-leaflet";
import useApi from "../hooks/useApi";
import { getAmbiance } from "../services/ambiance";
import { useNavigate } from "react-router-dom";

export default function Location({ lat, lon, loc }) {
    // L'utilisation de React Leaflet a été faite avec la documentation (React Leaflet, s.d.)
    // L'astuce pour les event handlers sur les markers provient de (Disco, 2022)
    // L'astuce pour useNavigate provient de (aravind_reddy, 2018)
    const navigate = useNavigate();
    const {data, loading, error} = useApi(() => (getAmbiance(loc, "2160h")))
    console.log(error)
    return(<>
        {(!loading &&!error) && <Marker position={[lat, lon]}
                eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                    click: (e) => navigate(`/view/${loc}`)
                }}>
            
            <Popup>
                Lieu: {loc} <br></br>
                Classification ambiance: {data.noiseLevel.toUpperCase()}
            </Popup>
        </Marker>
        }
        {!error &&loading&& <Marker position={[lat, lon]}
                eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                    click: (e) => navigate(`/view/${loc}`)
                }}>
            
            <Popup>
                Lieu: {loc} <br></br>
                <span className="text-warning">La classification est entrain de charger. Si ca prend trop longtemps, veuillez rafraîchir la page.</span>
            </Popup>
        </Marker>}
        {error && <Marker position={[lat, lon]}
                eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                    click: (e) => navigate(`/view/${loc}`)
                }}>
            
            <Popup>
                Lieu: {loc} <br></br>
                <span className="text-danger">Il y a eu un erreur lors du chargement de cette location. Veuillez rafraichir la page ou appuyer sur le marqueur pour en voir plus.</span>
            </Popup>
        </Marker>}</>
    )   
    
 


}