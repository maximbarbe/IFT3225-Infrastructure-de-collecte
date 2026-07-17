import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { postObservation } from '../services/observation';


export default function Observation() {
    const [error, setError] = useState("")
    const [type, setType] = useState("password")
    const [disabled, setDisabled] = useState(false)
    const {user, setUser} = useAppContext();
    const [success, setSuccess] = useState("")
// L'astuce pour la protection des routes provient de (user24854189, 2024)
    if (!user) {
        return <Navigate to="/connection" replace />
    }
    async function submitForm(event) {
        event.preventDefault();
        
        const data = new FormData(event.target);
        try {
            setSuccess("")
            setDisabled(true);
            const response = await postObservation(Object.fromEntries(data.entries()), user.token)
            setError("")  
            setSuccess("L'observation a bien été envoyée!") 
        } catch (e) {
            setError(e.message)
        } finally {
            setDisabled(false)
        }
    }
    


    return (
    // Les formulaires ont été construits à l'aide des exemples dans la documentation de bootstrap et react bootstrap.
    // (React Boostrap, s.d.b) et (React Bootstrap, s.d.c)
    // Le padding a été fait à l'aide de la documentation de bootstrap (Bootstrap, s.d.b)
    <Form className="mx-auto w-50 pt-5" onSubmit={submitForm}>
        <Form.Group className="mb-3" controlId="formBasicLocation">
            <Form.Label>Nom de la location</Form.Label>
            <Form.Control type="text" name="location" placeholder="Location" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicProximity">
            <Form.Label>Proximité de la plus proche source de son humain</Form.Label>
            <Form.Select name="proximity" aria-label="Default select example">
                <option value="PROCHE">Proche</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="LOIN">Loin</option>
            </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicVibe">
            <Form.Label>Vibe général de l'endroit</Form.Label>
            <Form.Select name="vibe" aria-label="Default select example">
                <option value="CALME">Calme</option>
                <option value="NORMAL">Normal</option>
                <option value="BRUYANT">Bruyant</option>
            </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicNotes">
            <Form.Label>Notes supplémentaires</Form.Label>
            <Form.Control type="text" name="notes" placeholder="Notes" />
        </Form.Group>
        {error && (
        <p className="text-danger">
            {error}
        </p>)}
        {success &&
        <p className="text-success">
            {success}
        </p>
        }
        
        <Button variant="primary" disabled={disabled} type="submit">
            Envoyer l'observation
        </Button>
    </Form>
    )
}