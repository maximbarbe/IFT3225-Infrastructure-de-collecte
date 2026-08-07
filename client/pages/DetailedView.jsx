import {useParams} from "react-router-dom";
import useApi from "../hooks/useApi";
import { getAmbiance, getHistory, getQuietHours } from "../services/ambiance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import DetailedViewRow from "../components/TableRow";
import Button from 'react-bootstrap/Button';
import { useCallback, useEffect, useMemo, useState } from 'react';


export default function DetailedView() {

    // L'astuce pour accéder aux paramètres dans le URL provient de (ReactRouter, s.d.)
    let { location } = useParams();
    const [disabled, setDisabled] = useState(false)

    // `location` est passée en dépendance: sans elle, naviguer d'un lieu à
    // l'autre garderait les données du lieu précédent (voir hooks/useApi.jsx).
    const quietHoursData = useApi(() => (getQuietHours(location, "2160h")), location, [location]);
    const historyData = useApi(() => (getHistory(location, "2160h")), location, [location]);
    const ambianceData = useApi(() => getAmbiance(location, "2160h"), location, [location]);

    const [favorited, setFavorited] = useState(() => isInFavorites(location))

    // Le composant n'est pas remonté quand on passe d'un lieu à l'autre:
    // il faut resynchroniser l'état « favori » explicitement.
    useEffect(() => {
        setFavorited(isInFavorites(location));
    }, [location])

    const addFavorite = useCallback((location) => {
        if (localStorage.getItem("favorites") === null) {
            localStorage.setItem("favorites", JSON.stringify([location]))
        } else {
            const favorites = JSON.parse(localStorage.getItem("favorites"))
            favorites.push(location)
            localStorage.setItem("favorites", JSON.stringify(favorites))
        }
        setFavorited(true)
    }, [])

    function isInFavorites(location) {
        if (localStorage.getItem("favorites") === null) {
            return false;
        }
        const favorites = JSON.parse(localStorage.getItem("favorites"))
        if (favorites.filter((f) => f === location).length !== 0) {
            return true
        }
        return false
    }

    const removeFavorite = useCallback((location) => {
        const favorites = JSON.parse(localStorage.getItem("favorites"))
        localStorage.setItem("favorites", JSON.stringify(favorites.filter((f) => f !== location)))
        setFavorited(false)
    }, [])


    function getColorClass(data) {
        if (data === "CALME") {
            return 'text-success'
        } else if (data === "MODÉRÉ") {
            return 'text-warning'
        } else {
            return 'text-danger'
        }
    }

    // Les trois blocs ci-dessous transforment la réponse de l'API en séries
    // pour Recharts. C'est du travail proportionnel au nombre de points, et il
    // était refait à chaque rendu (chaque clic sur « favoris » le relançait).
    // useMemo le lie aux données plutôt qu'au rendu.
    const quietHoursSeries = useMemo(() => {
        if (!quietHoursData.data) return null;

        const data = [];
        for (let i = 0; i < 24; i++) {
            data.push({ name: `Hour ${i}` })
        }
        const hours = quietHoursData.data.hours
        for (let i = 0; i < hours.length; i++) {
            data[hours[i].hour] = { ...data[hours[i].hour], "decibels (dB)": hours[i].averageNoise }
        }
        return data;
    }, [quietHoursData.data]);

    const historicalGraphData = useMemo(() => {
        if (!historyData.data) return [];
        return historyData.data.series.map((dataPoint) => ({
            "name": dataPoint.bucketStart,
            "decibels (dB)": dataPoint.averageNoise
        }));
    }, [historyData.data]);

    // Le bar chart et le line chart sont des arbres React entiers: on les
    // reconstruit seulement quand leurs données changent.
    // Le code pour le bar chart a été tiré de (Recharts, s.d.a) et adapté à nos fins.
    const chart = useMemo(() => {
        if (!quietHoursSeries) return null;
        return (
            <BarChart
                style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
                responsive
                data={quietHoursSeries}
                margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis width="auto" />
                <Tooltip />
                <Legend />
                <Bar dataKey="decibels (dB)" fill="#8884d8" activeBar={{ fill: 'pink', stroke: 'blue' }} radius={[10, 10, 0, 0]} />
            </BarChart>
        );
    }, [quietHoursSeries]);

    // Le code pour le line chart a été tiré de (Recharts, s.d.b) et adapté à nos fins
    // Le fix pour le bug que la ligne n'apparaissait pas provient du code écrit dans ce post.
    // Il s'agit du stroke="#000000" qui a fix le problème. (LoF10, 2019)
    const lineChart = useMemo(() => (
        <LineChart
            style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={historicalGraphData}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="var(--color-text-3)" tick={false} />
            <YAxis width="auto" stroke="var(--color-text-3)" />
            <Tooltip
                cursor={{ stroke: 'var(--color-border-2)' }}
                contentStyle={{
                    backgroundColor: 'var(--color-surface-raised)',
                    borderColor: 'var(--color-border-2)',
                }}
            />
            <Legend />
            <Line
                type="monotone"
                dataKey="decibels (dB)"
                stroke="#000000"
                dot={{ fill: '#000000' }}
                activeDot={{ r: 8, stroke: 'var(--color-surface-base)' }}
            />
        </LineChart>
    ), [historicalGraphData]);

    // Le tableau peut contenir des centaines de lignes: mémoïsé lui aussi, et
    // chaque ligne est un composant mémoïsé (voir components/TableRow.jsx).
    const tableRows = useMemo(() => {
        if (!historyData.data) return null;
        return historyData.data.series.map((data, index) => (
            <DetailedViewRow
                key={data.bucketStart ?? index}
                index={index}
                bucketStart={data.bucketStart}
                averageNoise={data.averageNoise}
                noiseLevel={data.noiseLevel}
                sampleCount={data.sampleCount}
            />
        ));
    }, [historyData.data]);


    let cName;

    if (ambianceData.data) {
        cName = getColorClass(ambianceData.data.noiseLevel.toUpperCase())
    }
    // Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
    // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    // Le loading icon est tirée de la documentation officielle de bootstrap (Bootstrap, s.d.d)
    return (
        <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5" style={{width: "100%"}}>
            <h1>Lieu: {location}</h1>
            {(quietHoursData.loading || historyData.loading || ambianceData.loading) &&
                <span className="spinner-border text-secondary" role="status">
                </span>
            }
            {(quietHoursData.error) &&
                <h1 className="text-danger">Quiet hours error: {quietHoursData.error.message}</h1>
            }
            {(historyData.error) &&
                <h1 className="text-danger">History data error: {historyData.error.message}</h1>
            }
            {(ambianceData.error) &&
                <h1 className="text-danger">History data error: {ambianceData.error.message}</h1>
            }
            {(!quietHoursData.error && !historyData.error && !ambianceData.error && !quietHoursData.loading && !historyData.loading && !ambianceData.loading) &&
            <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                <div className="d-flex align-items-center justify-content-center">
                    <h3>Classification d'ambiance courante: <span className={cName}>{ambianceData.data.noiseLevel.toUpperCase()}</span></h3>
                </div>
                <h4>Graphique montrant les niveaux sonores moyens pour les heures de la journée (UTC).</h4>
                {chart}
                <h4>Graphique montrant l'historique par bloc de 15 minutes (Une vue tabulaire est plus bas) (UTC).</h4>
                {lineChart}

                <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                    <h3>Vue détaillée par bloc de 15 minutes (UTC)</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Début du bucket</th>
                                <th scope="col">Décibels moyens</th>
                                <th scope="col">Niveau de bruit</th>
                                <th scope="col">Nombre d'échantillons</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </table>


                </div>

                {!favorited && <Button variant="primary" disabled={disabled} onClick={() => addFavorite(location)}>Ajouter à mes favoris</Button>}
                {favorited && <Button variant="danger" disabled={disabled} onClick={() => removeFavorite(location)}>Retirer de mes favoris</Button>}
            </div>



            }

        </div>
    )
}
