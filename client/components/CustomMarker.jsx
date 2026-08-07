import { Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


export default function CustomMarker({lat, lon, loc, msg, textType=null}) {

    // https://stackoverflow.com/a/51222271

    const DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    return (
        <Marker position={[lat, lon]}
                eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                    click: (e) => navigate(`/view/${loc}`)
                }}
                icon={DefaultIcon}>
            
            <Popup>
                Lieu: {loc} <br></br>
                <span className={textType}>{msg}</span> 
            </Popup>
        </Marker>
    )
}