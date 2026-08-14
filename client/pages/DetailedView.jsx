import {useParams} from "react-router-dom";
import useApi from "../hooks/useApi";
import { getAmbiance, getHistory, getQuietHours } from "../services/ambiance";
import { getRecentObservations } from "../services/observation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useAppContext } from '../context/AppContext';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import Table from "../components/Table";
import { useMemo } from "react";


export default function DetailedView() {

    // L'astuce pour accéder aux paramètres dans le URL provient de (ReactRouter, s.d.)
    let { location } = useParams();
    const [disabled, setDisabled] = useState(false)
    const quietHoursData = useApi(() => (getQuietHours(location, "2160h")));
    const historyData= useApi(() => (getHistory(location, "2160h")));
    const ambianceData = useApi(() => getAmbiance(location, "2160h"))
    const recentObservationsData = useApi(() => getRecentObservations(location))
    const {user, setUser} = useAppContext();
    const [favorited, setFavorited] = useState(isInFavorites(location))

    function addFavorite(location) {
        if (localStorage.getItem("favorites") === null) {
            localStorage.setItem("favorites", JSON.stringify([location]))
        } else {
            const favorites = JSON.parse(localStorage.getItem("favorites"))
            favorites.push(location)
            localStorage.setItem("favorites", JSON.stringify(favorites))
        }
        setFavorited(true)
    }

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

    function removeFavorite(location) {
        const favorites = JSON.parse(localStorage.getItem("favorites"))
        localStorage.setItem("favorites", JSON.stringify(favorites.filter((f) => f !== location)))
        setFavorited(false)
    }


    function getColorClass(data) {
        if (data === "CALME") {
            return 'text-success'
        } else if (data === "MODÉRÉ") {
            return 'text-warning'
        } else {
            return 'text-danger'
        }
    }
    

    
    
    const barChart = useMemo(() => {
        let chart;
        let data = []
        if (quietHoursData.data) {
            for (let i = 0; i < 24; i++) {
                data.push({name: `Hour ${i}`})
            }
            const hours = quietHoursData.data.hours
            
            for (let i = 0; i < hours.length; i++) {
                data[hours[i].hour] = {...data[hours[i].hour], "decibels (dB)":hours[i].averageNoise}
            }
        // Le code pour le bar chart a été tiré de (Recharts, s.d.a) et adapté à nos fins.
        chart = <BarChart
        style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
        responsive
        data={data}
        margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
        }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis width="auto" />
        <Tooltip />
        <Legend />
        <Bar dataKey="decibels (dB)" fill="#8884d8" activeBar={{ fill: 'pink', stroke: 'blue' }} radius={[10, 10, 0, 0]} />
        </BarChart>;
        }
        return chart
    }, [quietHoursData.data]) 
    
    const lineChart = useMemo(() => {
        const historicalGraphData = []

        if (historyData.data) {
            for (let dataPoint of historyData.data.series) {
                historicalGraphData.push({"name": dataPoint.bucketStart, "decibels (dB)": dataPoint.averageNoise})
            }
        }

        // Le code pour le line chart a été tiré de (Recharts, s.d.b) et adapté à nos fins
        // Le fix pour le bug que la ligne n'apparaissait pas provient du code écrit dans ce post.
        // Il s'agit du stroke="#000000" qui a fix le problème. (LoF10, 2019)
        const lc =         <LineChart
        style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
        responsive
        data={historicalGraphData}
        margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
        }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="var(--color-text-3)" tick={false}/>
        <YAxis width="auto" stroke="var(--color-text-3)" />
        <Tooltip
            cursor={{
            stroke: 'var(--color-border-2)',
            }}
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
            dot={{
            fill: '#000000',
            }}
            activeDot={{ r: 8, stroke: 'var(--color-surface-base)' }}
        />
        </LineChart>
        return lc
    }, [historyData.data])

    let cName;

    if (ambianceData.data) {
        cName = getColorClass(ambianceData.data.noiseLevel.toUpperCase())
    }
   
    const buildRow = (data, index) => (
        <>
            <td>{data.bucketStart}</td>
            <td>{data.averageNoise}</td>
            <td >{data.noiseLevel}</td>
            <td>{data.sampleCount}</td>
        </>
    )

    const getDate = (strRep) => {
        try {
            const date = new Date(strRep)
            // https://www.geeksforgeeks.org/javascript/how-to-check-a-date-is-valid-or-not-using-javascript/
            if (isNaN(date.getTime())) {
                return "n/a"
            }
            return `${date.toLocaleDateString("fr-ca")} / ${date.toLocaleTimeString("en-US")}`
        } catch (e) {
            return "n/a"
        }
    }

    const buildObservationRow = (data, index) => (
        <>
            <td>{data.location}</td>
            <td>{data.proximity}</td>
            <td>{data.vibe}</td>
            <td>{data.notes}</td>
            <td>{getDate(data.createdAt)}</td>
        </>
    )
    

    // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    // Le loading icon est tirée de la documentation officielle de bootstrap (Bootstrap, s.d.d)
    return (
        <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5" style={{width: "100%"}}>
            <h1>Lieu: {location}</h1>
            {(quietHoursData.loading || historyData.loading || ambianceData.loading || recentObservationsData.loading) &&
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
                <h1 className="text-danger">Ambiance data error: {ambianceData.error.message}</h1>
            }
            {(recentObservationsData.error) &&
                <h1 className="text-danger">Recent observations error: {recentObservationsData.error.message}</h1>
            }
            {(!quietHoursData.error && !historyData.error && !ambianceData.error && !quietHoursData.loading && !historyData.loading && !ambianceData.loading && ! recentObservationsData.loading && !recentObservationsData.error) && 
            <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                <div className="d-flex align-items-center justify-content-center">
                    <h3>Classification d'ambiance courante: <span className={cName}>{ambianceData.data.noiseLevel.toUpperCase()}</span></h3>
                </div>
                <h4>Graphique montrant les niveaux sonores moyens pour les heures de la journée (UTC).</h4>
                {barChart}
                <h4>Graphique montrant l'historique par bloc de 15 minutes (Une vue tabulaire est plus bas) (UTC).</h4>
                {lineChart}

                <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                    <h3>Vue détaillée par bloc de 15 minutes (UTC)</h3>
                    <Table columns={["Début du bucket", "Décibels moyens", "Niveau de bruit", "Nombre d'échantillons"]} data={historyData.data.series} buildRow={buildRow}/>
                </div>
                
                <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                    <h3>Les 5 observations les plus récentes</h3>
                    <Table columns={["Location", "Proximité de la plus proche source de bruit humain", "Vibe général de l'endroit", "Notes supplémentaires", "Date de l'observation"]} data={recentObservationsData.data} buildRow={buildObservationRow}/>
                </div>

                {!favorited && <Button variant="primary" disabled={disabled} onClick={() => addFavorite(location)}>Ajouter à mes favoris</Button>}
                {favorited && <Button variant="danger" disabled={disabled} onClick={() => removeFavorite(location)}>Retirer de mes favoris</Button>}
            </div>    
                
                

            }

        </div>
    )
}
