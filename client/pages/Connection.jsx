import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { loginUser } from '../services/users';
import { useNavigate } from "react-router-dom";


// https://react-bootstrap.netlify.app/docs/forms/overview/
export default function Connection() {
    const [error, setError] = useState("")
    const [type, setType] = useState("password")
    const [disabled, setDisabled] = useState(false)
    const {user, setUser} = useAppContext();
    const navigate = useNavigate();


    async function submitForm(event) {
        event.preventDefault();
        
        const data = new FormData(event.target);
        console.log(data.get("email"));
        try {
            setDisabled(true);
            const response = await loginUser(Object.fromEntries(data.entries()));
            setUser({token: response.token, ...response.user})
            setError("")      
            navigate("/")  
        } catch (e) {
            setError(e.message)
        } finally {
            setDisabled(false)
        }
    }



    return (
        // https://getbootstrap.com/docs/5.1/utilities/spacing/
        // https://react-bootstrap.netlify.app/docs/forms/validation
    <Form className="mx-auto w-50 pt-5" onSubmit={submitForm}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adresse courriel</Form.Label>
            <Form.Control type="email" name="email" placeholder="Adresse Courriel" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control type={type} name="password" placeholder="Mot de passe" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Voir mot de passe" onClick={() => {setType(prev => (prev === "password" ? "text" : "password"))}}/>
        </Form.Group>
        {error && (
        <p className="text-danger">
            {error}
        </p>)
        }
        <Button variant="primary" disabled={disabled} type="submit">
            Se connecter
        </Button>
    </Form>
    )
}