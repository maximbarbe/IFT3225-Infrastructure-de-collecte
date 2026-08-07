import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Map from "../pages/Map";
import Layout from "../components/Layout";
import { Fournisseur } from "../context/Fournisseur";

// La carte est la page d'accueil: elle reste dans le paquet initial.
//
// Les autres pages sont chargées à la demande. C'est surtout `DetailedView` qui
// compte: elle est la seule à importer Recharts, une des plus grosses
// dépendances du projet. Sans découpage, chaque visiteur téléchargeait la
// bibliothèque de graphiques avant même de voir la carte.
const Connection = lazy(() => import("../pages/Connection"));
const AccountCreation = lazy(() => import("../pages/AccountCreation"));
const Observation = lazy(() => import("../pages/Observation"));
const DetailedView = lazy(() => import("../pages/DetailedView"));
const Favorites = lazy(() => import("../pages/Favorites"));
const Locations = lazy(() => import("../pages/Locations"));
const LocationCreation = lazy(() => import("../pages/LocationCreation"));
const Contributions = lazy(() => import("../pages/Contributions"));

// Affiché le temps que le morceau de code de la page arrive.
// Le loading icon est tirée de la documentation officielle de bootstrap (Bootstrap, s.d.d)
function PageLoader() {
  return (
    <div className="d-flex align-items-center justify-content-center flex-column mb-3 pt-5">
      <span className="spinner-border text-secondary" role="status"></span>
    </div>
  );
}

// // L'astuce pour accéder aux paramètres dans le URL provient de (ReactRouter, s.d.)
function App() {
  return (
    <Fournisseur>
      <Layout>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </Layout>
    </Fournisseur>
  )
}

export default App
