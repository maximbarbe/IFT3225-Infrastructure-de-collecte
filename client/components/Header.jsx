import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';


export default function Header() {
  const {user, setUser} = useAppContext();
  
  return (
    // Cet extrait a été tiré de https://react-bootstrap.netlify.app/docs/components/navbar/ et adapté à nos fins.
    // (React Bootstrap, s.d.)
    // L'astuce pour Nav.Link as {Link} a été pris de (SrThompson, 2019)
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" sticky="top">
      <Container>
        <Navbar.Brand to="/">Infrastructure de collecte</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="btn btn-primary">Carte</Nav.Link>
            <Nav.Link as={Link} to="/favorites" className="btn btn-primary"> Mes favoris</Nav.Link>
            {user && <Nav.Link as={Link} to="/observation" className="btn btn-primary">Ajouter une observation</Nav.Link>}
            {user && <Nav.Link as={Link} to="/addLocation" className="btn btn-primary">Ajouter une location</Nav.Link>}
          </Nav>
          <Nav>

            {!user && <Nav.Link as={Link} to="/connection" className="btn btn-primary">Se connecter</Nav.Link>}
            {!user && <Nav.Link as={Link} to="/register" className="btn btn-primary"> Créer un compte</Nav.Link>}
            {user && <Nav.Link as={Link} to="/contributions" className="btn btn-primary">Mes contributions</Nav.Link>}
            {user && <Nav.Link as={Link} to="/myLocations" className="btn btn-primary">Mes lieux</Nav.Link>}
            {user && <Nav.Link as={Link} to="/" className="btn btn-primary" onClick={() => setUser(null)}> Se déconnecter</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
