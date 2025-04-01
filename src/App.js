import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./services/UserContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import WareHouse from "./pages/WareHouse";
import Management from "./pages/Management";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";

function App() {
  return (
    <UserProvider>
      <Router>
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
