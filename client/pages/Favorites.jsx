import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { postObservation } from '../services/observation';

// https://getbootstrap.com/docs/4.0/utilities/flex/
// https://getbootstrap.com/docs/5.3/content/tables/
export default function Favorites() {

    function getFavorites() {
        const favorites = JSON.parse(localStorage.getItem("favorites"))
        if (favorites === null) {
            return []
        }
        return favorites
    }

    function removeFavorite(favorites, data) {
        const updatedFavorites = favorites.filter((f) => f !== data)
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
        setFavorites(updatedFavorites)
    }

    const [favorites, setFavorites] = useState(getFavorites())

    


    return (<div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
        {(favorites.length === 0) &&
        <h1>Vous n'avez aucune location favori!</h1>}
        {(favorites.length !== 0) &&
                <div style={{width: "50%"}}>
                    <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Location</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                        <tbody>
                            {favorites.map((data, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{data}</td>
                                    <td><Button variant="danger" onClick={() => removeFavorite(favorites, data)}>Retirer</Button></td>
                                </tr>

                            ))}
                        </tbody>
                </table>
                </div>

        }
    </div>
    )
}