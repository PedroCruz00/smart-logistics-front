import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/Home";
import Management from "./pages/Management";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Navbar /> {/* Navbar siempre visible */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/management" element={<Management />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
