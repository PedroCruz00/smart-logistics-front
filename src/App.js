import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout"; // Nuevo Layout
import Home from "./pages/Home";
import Management from "./pages/Management";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Layout>
        {" "}
        {/* Navbar y Footer dentro de Layout */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/management" element={<Management />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
