import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button"; // Asumiendo que existe este componente
import "./Management.css";

const API_URL = process.env.REACT_APP_API_URL;

function Management() {
  const [searchId, setSearchId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!API_URL) {
      console.error(
        "❌ ERROR: La variable de entorno REACT_APP_API_URL no está definida."
      );
      setError("Error: Backend URL no está configurado.");
      setLoading(false);
      return;
    }

    const fetchWarehouses = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No hay token de autenticación.");

        const response = await fetch(`${API_URL}/almacenes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          throw new Error(`Error al obtener almacenes: ${response.status}`);

        const data = await response.json();
        setWarehouses(Array.isArray(data) ? data : [data]); //* Asegura que siempre sea un array*
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  // Función para manejar la inspección de un almacén
  const handleInspect = (warehouseId) => {
    // Primero verificamos que tenemos un token válido
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No hay token de autenticación. Inicie sesión nuevamente.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    // Navegar a la página de edición del almacén con el ID
    navigate(`/almacen/edit/${warehouseId}`);
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.id?.toString().includes(searchId.trim())
  );

  // Componente de tarjeta con botón de inspección
  const WarehouseCard = ({ warehouse }) => (
    <div className="warehouse-card">
      <Card
        id={warehouse.id}
        title={warehouse.name || "Almacén sin nombre"}
        description={`Ubicación: ${warehouse.location || "No especificada"}`}
      />
      <div className="card-actions">
        <Button 
          className="inspect-button"
          onClick={() => handleInspect(warehouse.id)}
        >
          Inspeccionar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="management-container">
      <h1>Gestión de Almacenes</h1>
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar por ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Cargando almacenes...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="grid">
          {filteredWarehouses.length > 0 ? (
            filteredWarehouses.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))
          ) : (
            <p>No se encontraron almacenes</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Management;