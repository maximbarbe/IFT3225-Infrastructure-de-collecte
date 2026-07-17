import { useAppContext } from '../context/AppContext';
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { getMyLocations } from '../services/locations';

// L'astuce pour useNavigate provient de (aravind_reddy, 2018)
export default function Locations() {

    const {user, setUser} = useAppContext();
    const navigate = useNavigate();
    
    const {data, loading, error} = useApi(() => (getMyLocations(user.token)))
    const myLocations = data
// L'astuce pour la protection des routes provient de (user24854189, 2024)
    if (!user) {
        return <Navigate to="/connection" replace />
    }
        // Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
    // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    return (<div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
        {loading && <span className="spinner-border text-secondary" role="status">
                </span>}
        {(!loading && myLocations.length === 0) &&
        <h1>Vous n'avez contribué à aucune location! Ajoutez une observation pour commencer</h1>}
        {(!loading && myLocations.length !== 0) &&
            <div style={{width: "50%"}}>
                <h1>Voici les locations auxquelles vous avez contribué:</h1>
                    <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Location</th>
                        </tr>
                    </thead>
                        <tbody>
                            {myLocations.map((data, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td><a className="btn text-primary" onClick={() => navigate(`/view/${data}`)}>{data}</a></td>
                                </tr>

                            ))}
                        </tbody>
                </table>
            </div>
        }
    </div>
    )
}