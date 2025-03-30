import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./services/UserContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import WareHouse from "./pages/WareHouse";
import Management from "./pages/Management";
import Settings from "./pages/Settings";

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/management" element={<Management />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/almacen/:id" element={<WareHouse />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

export default App;
