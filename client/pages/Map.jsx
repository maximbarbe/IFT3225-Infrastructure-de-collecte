import { MapContainer, TileLayer } from "react-leaflet";
import Location from "../components/Location";
import useApi from "../hooks/useApi";
import { getActiveLocations } from "../services/locations";

import "leaflet/dist/leaflet.css";

// L'utilisation de React Leaflet a été faite avec la documentation (React Leaflet, s.d.)
export default function Map() {
    // Recupere les locations directement depuis le backend
    const { data , loading, error} = useApi(getActiveLocations);
    const locations = data || [];
    return (
    <MapContainer 
        center={[45.50115154720588, -73.61563832781788]} 
        zoom="12" 
        scrollWheelZoom={true}
        // L'astuce pour le style a été tirée de (jamedeus, 2023)
        style={{height: "100vh"}}
      >
        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!error && locations.map((loc, index) => (
            <Location key={index} lat={loc.lat} lon={loc.lon} loc={loc.location} />
        ))}


      </MapContainer>
    )
}