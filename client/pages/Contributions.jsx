import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { getMyLocations } from '../services/locations';
import { getMyObservations } from '../services/observation';

// https://getbootstrap.com/docs/4.0/utilities/flex/
// https://getbootstrap.com/docs/5.3/content/tables/
export default function Contributions() {

    const {user, setUser} = useAppContext();
    const navigate = useNavigate();
    
    const {data, loading, error} = useApi(() => (getMyObservations(user.token)))
    const myObservations = data
    if (!user) {
        //https://stackoverflow.com/a/78447971
        return <Navigate to="/connection" replace />
    }
    return (<div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
        {loading && <span className="spinner-border text-secondary" role="status">
                </span>}
        {(!loading && myObservations.length === 0) &&
        <h1>Vous n'avez fait aucune observation! Ajoutez une observation pour commencer</h1>}
        {(!loading && myObservations.length !== 0) &&
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