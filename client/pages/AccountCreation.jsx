import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { postNewUser } from '../services/users';
// https://react-bootstrap.netlify.app/docs/forms/overview/
export default function AccountCreation() {
    const [type, setType] = useState("password")
    const [error, setError] = useState("")
    const [disabled, setDisabled] = useState(false)
    const [success, setSuccess] = useState("")

    // Les hooks doivent etre appeles dans le composant, pas au niveau du module
    async function submitForm(event) {
        event.preventDefault();
    
        const data = new FormData(event.target);
        if (data.get("password") !== data.get("passwordConfirmed")) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setError("");
        try {
            setDisabled(true);
            const response = await postNewUser(Object.fromEntries(data.entries()));
            setError("")
            setSuccess("Le compte a été créé avec succès!")
        } catch (e) {
            setSuccess("")
            setError(e.message)
        } finally {
            setDisabled(false)
        }
        
    }

    return (        // https://getbootstrap.com/docs/5.1/utilities/spacing/
        // https://react-bootstrap.netlify.app/docs/forms/validation
    <Form className="mx-auto w-50 pt-5" onSubmit={submitForm}>
        <Form.Group className="mb-3" name = "test"controlId="formBasicFirstName">
            <Form.Label>Prénom</Form.Label>
            <Form.Control type="text" name="firstName" placeholder="Prénom" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicLastName">
            <Form.Label>Nom de famille</Form.Label>
            <Form.Control type="text" name="lastName" placeholder="Nom de famille" />
        </Form.Group>        
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adresse Courriel</Form.Label>
            <Form.Control type="email" name="email" placeholder="Adresse Courriel" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control type={type} name="password" placeholder="Mot de passe" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPasswordConfirm">
            <Form.Label>Confirmer mot de passe</Form.Label>
            <Form.Control type={type} name="passwordConfirmed" placeholder="Mot de passe"/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Voir mot de passe" onClick={() => {setType(prev => (prev === "password" ? "text" : "password"))}}/>
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
            Créer un compte
        </Button>
    </Form>
    )
}
