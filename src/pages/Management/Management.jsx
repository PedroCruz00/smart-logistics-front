import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
import VirtualWarehouseCard from "../../components/WarehouseCard/WarehouseCard";
import "./Management.css";

const API_URL = process.env.REACT_APP_API_URL;

function Management() {
  const [searchId, setSearchId] = useState("");
  const [activeTab, setActiveTab] = useState("physical"); // Estado para controlar la pestaña activa
  const [physicalWarehouses, setPhysicalWarehouses] = useState([]);
  const [virtualWarehouse, setVirtualWarehouse] = useState(null);
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

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No hay token de autenticación.");

        // Obtener almacenes físicos
        const physicalResponse = await fetch(`${API_URL}/almacenes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!physicalResponse.ok)
          throw new Error(
            `Error al obtener almacenes físicos: ${physicalResponse.status}`
          );

        const physicalData = await physicalResponse.json();
        console.log("Datos de almacenes físicos recibidos:", physicalData);
        setPhysicalWarehouses(
          Array.isArray(physicalData) ? physicalData : [physicalData]
        );

        // Obtener almacén virtual
        const virtualResponse = await fetch(`${API_URL}/almacen-virtual`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!virtualResponse.ok)
          throw new Error(
            `Error al obtener almacén virtual: ${virtualResponse.status}`
          );

        const virtualData = await virtualResponse.json();
        setVirtualWarehouse(virtualData);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInspect = (warehouseId, isVirtual = false) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No hay token de autenticación. Inicie sesión nuevamente.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (isVirtual && virtualWarehouse) {
      navigate("/almacen-virtual", {
        state: { warehouse: virtualWarehouse },
      });
    } else {
      navigate(`/almacen/${warehouseId}`);
    }
  };

  const filteredPhysicalWarehouses = physicalWarehouses.filter((warehouse) =>
    warehouse.id?.toString().includes(searchId.trim())
  );

  return (
    <div className="management-container">
      <h1>Gestión de Almacenes</h1>

      <div className="tabs-container">
        <div
          className={`tab ${activeTab === "physical" ? "active" : ""}`}
          onClick={() => setActiveTab("physical")}
        >
          Almacenes Físicos
        </div>
        <div
          className={`tab ${activeTab === "virtual" ? "active" : ""}`}
          onClick={() => setActiveTab("virtual")}
        >
          Almacén Virtual
        </div>
      </div>

      {activeTab === "physical" && (
        <div className="filter-container">
          <input
            type="text"
            placeholder="Filtrar por ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <p>Cargando almacenes...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="tab-content">
          {activeTab === "physical" ? (
            <div className="grid">
              {filteredPhysicalWarehouses.length > 0 ? (
                filteredPhysicalWarehouses.map((warehouse) => (
                  <Card
                    key={warehouse.id}
                    id={warehouse.id}
                    title={warehouse.name || "Almacén sin nombre"}
                    description={`Ubicación: ${
                      warehouse.location || "No especificada"
                    }`}
                  />
                ))
              ) : (
                <p>No se encontraron almacenes físicos</p>
              )}
            </div>
          ) : (
            <div className="grid">
              {virtualWarehouse ? (
                <VirtualWarehouseCard
                  id={virtualWarehouse.id || "virtual"}
                  title={virtualWarehouse.name || "Almacén Virtual"}
                  description={`Productos: ${
                    virtualWarehouse.products?.length || 0
                  }`}
                />
              ) : (
                <p>No se encontró el almacén virtual</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Management;
