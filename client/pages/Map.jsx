import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";


export default function Map() {
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

      </MapContainer>
    )
}