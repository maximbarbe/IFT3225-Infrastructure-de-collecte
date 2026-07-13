import { Marker, Popup } from "react-leaflet";
import useApi from "../hooks/useApi";
import { getAmbiance } from "../services/ambiance";
import { useNavigate } from "react-router-dom";
// Va devoir changer la description pour passer un objet pour faire un popup
export default function Location({ lat, lon, loc }) {
    // https://react-leaflet.js.org/docs/start-setup/
    // https://stackoverflow.com/a/71428345
    // https://stackoverflow.com/a/50645395
    const navigate = useNavigate();
    const {data, loading, error} = useApi(() => (getAmbiance(loc)))
    if (data) {
        return(
            <Marker position={[lat, lon]}
                    eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        mouseout: (e) => e.target.closePopup(),
                        click: (e) => navigate("/login")
                    }}>
                
                <Popup>
                    Lieu: {data.location} <br></br>
                    Classification ambiance: {data.noiseLevel.toUpperCase()}
                </Popup>
            </Marker>
        )   
    }
 


}