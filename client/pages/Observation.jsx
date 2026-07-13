import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { postObservation } from '../services/observation';


export default function Observation() {
    const [error, setError] = useState("")
    const [type, setType] = useState("password")
    const [disabled, setDisabled] = useState(false)
    const {user, setUser} = useAppContext();
    const [success, setSuccess] = useState("")


    if (!user) {
        console.log(user)
        //https://stackoverflow.com/a/78447971
        return <Navigate to="/login" replace />
    }
    async function submitForm(event) {
        event.preventDefault();
        
        const data = new FormData(event.target);
        console.log(data)
        try {
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
        // https://getbootstrap.com/docs/5.1/utilities/spacing/
        // https://react-bootstrap.netlify.app/docs/forms/validation
        // https://react-bootstrap.netlify.app/docs/forms/input-group
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