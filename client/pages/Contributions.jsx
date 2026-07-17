import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { getMyObservations } from '../services/observation';


export default function Contributions() {

    const {user, setUser} = useAppContext();
    // L'astuce pour useNavigate provient de (aravind_reddy, 2018)
    const navigate = useNavigate();
    
    const {data, loading, error} = useApi(() => (getMyObservations(user.token)))
    const myObservations = data || []
    // L'astuce pour la protection des routes provient de (user24854189, 2024)
    if (!user) {
        return <Navigate to="/connection" replace />
    }

    // Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
    // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    // Le loading icon est tirée de la documentation officielle de bootstrap (Bootstrap, s.d.d)
    return (<div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
        
        {loading && <span className="spinner-border text-secondary" role="status">
                </span>}
        {(!loading && !error && myObservations.length === 0) &&
        <h1>Vous n'avez fait aucune observation! Ajoutez une observation pour commencer</h1>}
        {(!loading && !error && myObservations.length !== 0) &&
            <div style={{width: "50%"}}>
                <h1>Voici vos observations:</h1>
                    <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Location</th>
                            <th scope="col">Proximité</th>
                            <th scope="col">Vibe</th>
                            <th scope="col">Notes</th>
                        </tr>
                    </thead>
                        <tbody>
                            {myObservations.map((data, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td><a className="btn text-primary" onClick={() => navigate(`/view/${data.location}`)}>{data.location}</a></td>
                                    <td>{data.proximity}</td>
                                    <td>{data.vibe}</td>
                                    <td>{data.notes || "No notes"}</td>
                                </tr>

                            ))}
                        </tbody>
                </table>
            </div>
        }
    </div>
    )
}