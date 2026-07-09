import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Location from "../components/Location";

import "leaflet/dist/leaflet.css";

export default function Map() {
    const locations = [
        {
            key: 1,
            lat: 40.82400443557466,
            lon: 14.428648136837062,
            desc: "Vesuve"
        },
        {
            key: 2,
            lat: 45.49623212108189,
            lon: -73.56927238734026,
            desc: "Centre Bell" 
        },
        {
            key: 3,
            lat: 45.46711932971945, 
            lon: -73.73792317787748,
            desc: "Aéroport International Montréal-Trudeau"
        },
        {
            key: 4,
            lat: 55.92135547376643,
            lon: 12.679341838376688,
            desc: "Sentier de randonnée suèdois" 
        }
    ]
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
        {locations.map((loc) => (
            <Location key={loc.key} lat={loc.lat} lon={loc.lon} desc={loc.desc} />
        ))}
        

      </MapContainer>
    )
}