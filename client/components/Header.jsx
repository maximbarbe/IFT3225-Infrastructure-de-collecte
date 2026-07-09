import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';


// https://react-bootstrap.netlify.app/docs/components/navbar/
export default function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" sticky="top">
      <Container>
        <Navbar.Brand to="/">Infrastructure de collecte</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link to="/">Carte</Nav.Link>
            <Nav.Link to="/observation">Ajouter une observation</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link to="/connection">Se Connecter</Nav.Link>
            <Nav.Link to="/compte">
              Créer un compte
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
