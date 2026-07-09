import { Marker, Popup } from "react-leaflet";


// Va devoir changer la description pour passer un objet pour faire un popup
export default function Location({ lat, lon, desc }) {
    // https://react-leaflet.js.org/docs/start-setup/
    return (
        <Marker position={[lat, lon]}>
            <Popup>
                {desc}
            </Popup>
        </Marker>
    )
}