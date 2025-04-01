import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./services/UserContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home/Home";
import WareHouse from "./pages/WareHouse/WareHouse";
import Management from "./pages/Management/Management";
import Settings from "./pages/Settings/Settings";
import EditStore from "./pages/EditStore/EditStore";

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
            <Route path="/editStore/:id" element={<EditStore />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

export default App;
