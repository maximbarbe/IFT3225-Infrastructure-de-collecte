import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppContext } from '../context/AppContext';
import { loginUser } from '../services/users';
import { useNavigate } from "react-router-dom";


// L'astuce pour useNavigate provient de (aravind_reddy, 2018)
export default function Connection() {
    const [error, setError] = useState("")
    const [type, setType] = useState("password")
    const [disabled, setDisabled] = useState(false)
    const {user, setUser} = useAppContext();
    const navigate = useNavigate();


    async function submitForm(event) {
        event.preventDefault();
        
        const data = new FormData(event.target);
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
    // Les formulaires ont été construits à l'aide des exemples dans la documentation de bootstrap et react bootstrap.
    // (React Boostrap, s.d.b) et (React Bootstrap, s.d.c)
    // Le padding a été fait à l'aide de la documentation de bootstrap (Bootstrap, s.d.b)
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