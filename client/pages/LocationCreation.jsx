import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { postLocation } from '../services/locations';
import { submitForm } from '../services/formSubmission';

export default function LocationCreation() {
    const {user, setUser} = useAppContext();
    const [error, setError] = useState("")
    const [disabled, setDisabled] = useState(false)
    const [success, setSuccess] = useState("")

// L'astuce pour la protection des routes provient de (user24854189, 2024)
    if (!user) {
        return <Navigate to="/connection" replace />
    }


    async function submitCallback(data) {
        setDisabled(true);
        const loc = Object.fromEntries(data.entries())
        loc.lat = Number(loc.lat)
        loc.lon = Number(loc.lon)
        const response = await postLocation(loc, user.token);
        setError("")
        setSuccess("La location a été créée avec succès!")
    }

    const errorCallback = (error) => {
        setSuccess("")
        setError(error.message)
    }

    const cleanupCallback = () => setDisabled(false)


    // Les formulaires ont été construits à l'aide des exemples dans la documentation de bootstrap et react bootstrap.
    // (React Boostrap, s.d.b) et (React Bootstrap, s.d.c)
    // Le padding a été fait à l'aide de la documentation de bootstrap (Bootstrap, s.d.b)
    return (        
    <Form className="mx-auto w-50 pt-5" onSubmit={(e) => {submitForm(e, submitCallback, errorCallback, cleanupCallback)}}>
        <Form.Group className="mb-3 "controlId="formBasicName">
            <Form.Label>Nom de la location</Form.Label>
            <Form.Control type="text" name="location" placeholder="Nom" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicLatitude">
            <Form.Label>Latitude</Form.Label>
            <Form.Control type="number" step="0.01" name="lat" placeholder="Latitude" />
        </Form.Group>        
        <Form.Group className="mb-3" controlId="formBasicLongitude">
            <Form.Label>Longitude</Form.Label>
            <Form.Control type="number" step="0.01" name="lon" placeholder="Longitude" />
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
