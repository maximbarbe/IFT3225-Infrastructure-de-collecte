import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Location from "../components/Location";
import useApi from "../hooks/useApi";
import { getActiveLocations } from "../services/locations";

import "leaflet/dist/leaflet.css";

export default function Map() {
    // Recupere les locations directement depuis le backend
    const { data , loading, error} = useApi(getActiveLocations);
    const locations = data || [];
    return (
    <MapContainer 
        center={[45.50115154720588, -73.61563832781788]} 
        zoom="12" 
        scrollWheelZoom={true}
        style={{height: "100vh"}}
      >
        <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, index) => (
            <Location key={index} lat={loc.lat} lon={loc.lon} loc={loc.location} />
        ))}


      </MapContainer>
    )
}