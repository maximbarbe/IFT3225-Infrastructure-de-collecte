import { useAppContext } from '../context/AppContext';
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { getMyLocations } from '../services/locations';
import Table from '../components/Table';

// L'astuce pour useNavigate provient de (aravind_reddy, 2018)
export default function Locations() {

    const {user, setUser} = useAppContext();
    const navigate = useNavigate();
    
    const {data, loading, error} = useApi(() => (getMyLocations(user.token)))

// L'astuce pour la protection des routes provient de (user24854189, 2024)
    const myLocations = data || []
    if (!user) {
        return <Navigate to="/connection" replace />
    }

    const buildRow = (data, index) => (
        <>
            <td><a className="btn text-primary" onClick={() => navigate(`/view/${data}`)}>{data}</a></td>
        </>
    )

        // Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
    // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    // Le loading icon est tirée de la documentation officielle de bootstrap (Bootstrap, s.d.d)
    return (<div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
        {loading && <span className="spinner-border text-secondary" role="status">
                </span>}
        {(!loading &&!error && myLocations.length === 0) &&
        <h1>Vous n'avez contribué à aucune location! Ajoutez une observation pour commencer</h1>}
        {(!loading &&!error&& myLocations.length !== 0) &&
            <div style={{width: "50%"}}>
                <h1>Voici les locations auxquelles vous avez contribué:</h1>
                <Table columns={["Location"]} data={myLocations} buildRow={buildRow}/>
                    
            </div>
        }
    </div>
    )
}