import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// https://react-bootstrap.netlify.app/docs/components/navbar/
// https://stackoverflow.com/a/54843616
export default function Header() {
  const {user, setUser} = useAppContext();
  
  return (
    
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" sticky="top">
      <Container>
        <Navbar.Brand to="/">Infrastructure de collecte</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="btn btn-primary">Carte</Nav.Link>
            <Nav.Link as={Link} to="/favorites" className="btn btn-primary"> Mes favoris</Nav.Link>
            {user && <Nav.Link as={Link} to="/observation" className="btn btn-primary">Ajouter une observation</Nav.Link>}
            
          </Nav>
          <Nav>

            {!user && <Nav.Link as={Link} to="/connection" className="btn btn-primary">Se connecter</Nav.Link>}
            {!user && <Nav.Link as={Link} to="/register" className="btn btn-primary"> Créer un compte</Nav.Link>}
            {user && <Nav.Link as={Link} to="/" className="btn btn-primary" onClick={() => setUser(null)}> Se déconnecter</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
