import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { postObservation } from '../services/observation';
import Table from '../components/Table';

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

    const buildRow = (data, index) => {
        return (<>
                    <td>{data}</td>
                    <td><Button variant="danger" onClick={() => removeFavorite(favorites, data)}>Retirer</Button></td>
                </>
        )
    }

    // Les tables sont basées sur la documentation officielle de bootstrap (Bootstrap, s.d.a)
    // Les classes pour le display flexbox et l'alignement sont tirées de la documentation officielle de bootstrap (Bootstrap, s.d.c)
    return (<div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
        {(favorites.length === 0) &&
        <h1>Vous n'avez aucune location favori!</h1>}
        {(favorites.length !== 0) &&
                <div style={{width: "50%"}}>
                    <Table columns={["Location", "Action"]} data={favorites} buildRow={buildRow}/>
                </div>

        }
    </div>
    )
}