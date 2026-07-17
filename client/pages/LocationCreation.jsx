import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { postLocation } from '../services/locations';


export default function LocationCreation() {
    const {user, setUser} = useAppContext();
    const [error, setError] = useState("")
    const [disabled, setDisabled] = useState(false)
    const [success, setSuccess] = useState("")

// L'astuce pour la protection des routes provient de (user24854189, 2024)
    if (!user) {
        return <Navigate to="/connection" replace />
    }


    // Les hooks doivent etre appeles dans le composant, pas au niveau du module
    async function submitForm(event) {
        event.preventDefault();
    
        const data = new FormData(event.target);
        setError("");
        try {
            setDisabled(true);
            const loc = Object.fromEntries(data.entries())
            loc.lat = Number(loc.lat)
            loc.lon = Number(loc.lon)
            const response = await postLocation(loc, user.token);
            setError("")
            setSuccess("La location a été créée avec succès!")
        } catch (e) {
            setSuccess("")
            setError(e.message)
        } finally {
            setDisabled(false)
        }
        
    }
    // Les formulaires ont été construits à l'aide des exemples dans la documentation de bootstrap et react bootstrap.
    // (React Boostrap, s.d.b) et (React Bootstrap, s.d.c)
    // Le padding a été fait à l'aide de la documentation de bootstrap (Bootstrap, s.d.b)
    return (        
    <Form className="mx-auto w-50 pt-5" onSubmit={submitForm}>
        <Form.Group className="mb-3 "controlId="formBasicName">
            <Form.Label>Nom de la location</Form.Label>
            <Form.Control type="text" name="location" placeholder="Nom" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicLatitude">
            <Form.Label>Latitude</Form.Label>
            <Form.Control type="number" name="lat" placeholder="Latitude" />
        </Form.Group>        
        <Form.Group className="mb-3" controlId="formBasicLongitude">
            <Form.Label>Longitude</Form.Label>
            <Form.Control type="number" name="lon" placeholder="Longitude" />
        </Form.Group>

        {error && (
    <p className="text-danger">
        {error}
    </p>
)}
        {success && (
    <p className="text-success">
        {success}
    </p>
)}
        <Button variant="primary" disabled={disabled} type="submit">
            Créer la location
        </Button>
    </Form>
    )
}
