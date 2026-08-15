import { Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useNavigate } from "react-router-dom";

export default function CustomMarker({lat, lon, loc, msg, clickFunction, textType=null}) {

    // L'astuce pour les marqueurs est tiré de (Tosic, 2018)
    // L'astuce pour les event handlers sur les markers provient de (Disco, 2022)
    // L'astuce pour useNavigate provient de (aravind_reddy, 2018)
    const DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    const navigate = useNavigate();

    return (
        <Marker position={[lat, lon]}
                eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                    click: (e) => clickFunction(e)
                }}
                icon={DefaultIcon}>
            
            <Popup>
                Lieu: {loc} <br></br>
                <span className={textType}>{msg}</span> 
            </Popup>
        </Marker>
    )
}
