import { Marker, Popup } from "react-leaflet";
import { memo, useMemo } from "react";
import useApi from "../hooks/useApi";
import { getAmbiance } from "../services/ambiance";
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// https://stackoverflow.com/a/51222271
// L'icône est construite une seule fois au chargement du module. Avant, chaque
// marqueur en recréait une et réécrivait le prototype de L.Marker à chaque
// rendu — un travail inutile multiplié par le nombre de lieux sur la carte.
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;


function Location({ lat, lon, loc }) {
    // L'utilisation de React Leaflet a été faite avec la documentation (React Leaflet, s.d.)
    // L'astuce pour les event handlers sur les markers provient de (Disco, 2022)
    // L'astuce pour useNavigate provient de (aravind_reddy, 2018)

    const navigate = useNavigate();

    // `loc` en dépendance: le marqueur recharge si le lieu change.
    // Les appels concurrents de tous les marqueurs sont dédupliqués et mis en
    // cache par services/cache.js.
    const {data, loading, error} = useApi(() => (getAmbiance(loc, "2160h")), loc, [loc]);

    const position = useMemo(() => [lat, lon], [lat, lon]);

    const handlers = useMemo(() => ({
        mouseover: (e) => e.target.openPopup(),
        mouseout: (e) => e.target.closePopup(),
        click: () => navigate(`/view/${loc}`)
    }), [navigate, loc]);

    return(<>
        {(!loading &&!error) && <Marker position={position}
                eventHandlers={handlers}
                icon={DefaultIcon}>

            <Popup>
                Lieu: {loc} <br></br>
                Classification ambiance: {data.noiseLevel.toUpperCase()}
            </Popup>
        </Marker>
        }
        {!error &&loading&& <Marker position={position}
                eventHandlers={handlers}
                icon={DefaultIcon}>

            <Popup>
                Lieu: {loc} <br></br>
                <span className="text-warning">La classification est entrain de charger. Si ca prend trop longtemps, veuillez rafraîchir la page.</span>
            </Popup>
        </Marker>}
        {error && <Marker position={position}
                eventHandlers={handlers}
                icon={DefaultIcon}>

            <Popup>
                Lieu: {loc} <br></br>
                <span className="text-danger">Il y a eu un erreur lors du chargement de cette location. Veuillez rafraichir la page ou appuyer sur le marqueur pour en voir plus.</span>
            </Popup>
        </Marker>}</>
    )
}

// La carte remonte tous ses marqueurs à chaque rendu du parent: `memo` coupe
// ces re-rendus quand lat/lon/loc n'ont pas changé.
export default memo(Location);
