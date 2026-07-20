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
        // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    // Le loading icon est tirée de la documentation officielle de bootstrap (Bootstrap, s.d.d)
    return (<>
        {loading &&
            <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                <h2>La carte est entrain de charger. Les locations peuvent apparaitre quelques secondes après que la carte apparaisse.</h2>
                <span className="spinner-border text-secondary" role="status">
                </span>
            </div>
        
        }
        {(!error && !loading) && <MapContainer 
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
            {locations.map((loc, index) => (
                <Location key={index} lat={loc.lat} lon={loc.lon} loc={loc.location} />
            ))}
        


        </MapContainer>}
        {error && <h1>Il y a eu un erreur lors du chargement de la carte.</h1>}
    </>)
}