import { Routes, Route } from "react-router-dom";
import Map from "../pages/Map";
import Connection from "../pages/Connection";
import Layout from "../components/Layout";
import AccountCreation from "../pages/AccountCreation";
import Observation from "../pages/Observation";
import DetailedView from "../pages/DetailedView";
import { Fournisseur } from "../context/Fournisseur";
import Favorites from "../pages/Favorites";
import Locations from "../pages/Locations";
import LocationCreation from "../pages/LocationCreation";
import Contributions from "../pages/Contributions"

// https://reactrouter.com/start/declarative/url-values
function App() {
  return (
    <Fournisseur>
      <Layout>
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/connection" element={<Connection />} />
          <Route path="/register" element={<AccountCreation />} />
          <Route path="/observation" element={<Observation />} />
          <Route path="/view/:location" element={<DetailedView />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/myLocations" element={<Locations />} />
          <Route path="/addLocation" element={<LocationCreation />} />
          <Route path="/contributions" element={<Contributions />} />
        </Routes>
      </Layout>
    </Fournisseur>
  )
}

export default App
