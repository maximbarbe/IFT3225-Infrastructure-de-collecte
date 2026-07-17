import { Marker, Popup } from "react-leaflet";
import useApi from "../hooks/useApi";
import { getAmbiance } from "../services/ambiance";
import { useNavigate } from "react-router-dom";

export default function Location({ lat, lon, loc }) {
    // L'utilisation de React Leaflet a été faite avec la documentation (React Leaflet, s.d.)
    // L'astuce pour les event handlers sur les markers provient de (Disco, 2022)
    // L'astuce pour useNavigate provient de (aravind_reddy, 2018)
    const navigate = useNavigate();
    const {data, loading, error} = useApi(() => (getAmbiance(loc)))
    if (data) {
        return(
            <Marker position={[lat, lon]}
                    eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        mouseout: (e) => e.target.closePopup(),
                        click: (e) => navigate(`/view/${loc}`)
                    }}>
                
                <Popup>
                    Lieu: {data.location} <br></br>
                    Classification ambiance: {data.noiseLevel.toUpperCase()}
                </Popup>
            </Marker>
        )   
    }
 


}