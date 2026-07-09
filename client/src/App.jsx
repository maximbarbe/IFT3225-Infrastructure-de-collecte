import { useState } from 'react'
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  return (
    <MapContainer 
      center={[43.38621, -79.83713]} 
      zoom="13" 
      scrollWheelZoom={false}
      style={{height: "100vh"}}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

    </MapContainer>
  )
}

export default App
