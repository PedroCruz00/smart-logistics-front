import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./services/UserContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
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
        <Routes>
          {/* Ruta pública para el login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas que requieren autenticación */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/management" element={
            <ProtectedRoute>
              <Layout>
                <Management />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/warehouse/:id" element={
            <ProtectedRoute>
              <Layout>
                <WareHouse />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
