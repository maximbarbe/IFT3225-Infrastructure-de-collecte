import {useParams} from "react-router-dom";
import useApi from "../hooks/useApi";
import { getAmbiance, getHistory, getQuietHours } from "../services/ambiance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DetailedViewRow from "../components/TableRow";
// https://recharts.github.io/en-US/api/BarChart/
//https://reactrouter.com/start/declarative/url-values
// https://getbootstrap.com/docs/4.0/utilities/flex/
// https://getbootstrap.com/docs/5.3/content/tables/
export default function DetailedView() {
    let { location } = useParams();
    const quietHoursData = useApi(() => (getQuietHours(location)));
    const historyData= useApi(() => (getHistory(location, "2160h")));
    const ambianceData = useApi(() => getAmbiance(location))
    let data = []
    let chart;
    if (quietHoursData.data) {
        for (let i = 0; i < 24; i++) {
            data.push({name: `Hour ${i}`})
        }
        const hours = quietHoursData.data.hours
        for (let i = 0; i < hours.length; i++) {
            data[hours[i].hour] = {...data[hours[i].hour], "decibels (dB)":hours[i].averageNoise}
        }
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
    
    let cName;

    if (ambianceData.data) {
        if (ambianceData.data.noiseLevel.toUpperCase() === "QUIET") {
            cName = "text-success";
        } else if (ambianceData.data.noiseLevel.toUpperCase() === "MODERATE") {
            cName = "text-warning"
        } else {
            cName = "text-danger"
        }
    }

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
                <h1 className="text-danger">History data error: {historyData.error.message}</h1>
            }
            {(!quietHoursData.error && !historyData.error && !ambianceData.error && !quietHoursData.loading && !historyData.loading && !ambianceData.loading) && 
            <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                <div className="d-flex align-items-center justify-content-center">
                    <h3>Classification d'ambiance courante: <span className={cName}>{ambianceData.data.noiseLevel.toUpperCase()}</span></h3>
                </div>
                <h4>Graphique montrant les niveaux sonores moyens pour les heures de la journée.</h4>
                {chart}
                <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
                    <h3>Vue détaillée par bloc de 15 minutes</h3>
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
                            {historyData.data.series.map((data, index) => (
                                <DetailedViewRow key={index} index={index} bucketStart={data.bucketStart} averageNoise={data.averageNoise} noiseLevel={data.noiseLevel} sampleCount={data.sampleCount} />
                            ))}
                        </tbody>
                    </table>
                    
                    
                </div>
            </div>    
                
                

            }

        </div>
    )
}