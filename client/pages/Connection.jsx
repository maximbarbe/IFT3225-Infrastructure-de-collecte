import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function submitForm(event) {
    event.preventDefault();
    event.stopPropagation();
    const data = new FormData(event.target);
    console.log(data.get("email"));
}

// https://react-bootstrap.netlify.app/docs/forms/overview/
export default function Connection() {
    
    const [type, setType] = useState("password")


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
        <Button variant="primary" type="submit">
            Se connecter
        </Button>
    </Form>
    )
}