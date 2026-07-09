import { Routes, Route } from "react-router-dom";
import Map from "../pages/Map";
import Connection from "../pages/Connection";
import Layout from "../components/Layout";
import AccountCreation from "../pages/AccountCreation";
import Observation from "../pages/Observation";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/connection" element={<Connection />} />
        <Route path="/compte" element={<AccountCreation />} />
        <Route path="/observation" element={<Observation />} />
      </Routes>
    </Layout>
  )
}

export default App
