import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import "./Management.css";

const API_URL = process.env.REACT_APP_API_URL;

function Management() {
  const [searchId, setSearchId] = useState("");
  const [activeTab, setActiveTab] = useState("physical"); // Estado para controlar la pestaña activa
  const [physicalWarehouses, setPhysicalWarehouses] = useState([]);
  const [virtualWarehouses, setVirtualWarehouses] = useState([]);
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
        console.log('Datos de almacenes físicos recibidos:', physicalData);
        setPhysicalWarehouses(
          Array.isArray(physicalData) ? physicalData : [physicalData]
        );

        // Obtener almacenes virtuales
        const virtualResponse = await fetch(`${API_URL}/almacen-virtual`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!virtualResponse.ok)
          throw new Error(
            `Error al obtener almacenes virtuales: ${virtualResponse.status}`
          );

        const virtualData = await virtualResponse.json();
        console.log('Datos de almacenes virtuales recibidos:', virtualData);
        setVirtualWarehouses(
          Array.isArray(virtualData) ? virtualData : [virtualData]
        );
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para manejar la inspección de un almacén
  const handleInspect = (warehouseId, isVirtual = false) => {
    // Primero verificamos que tenemos un token válido
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No hay token de autenticación. Inicie sesión nuevamente.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    // La URL podría ser diferente según el tipo de almacén
    const path = isVirtual
      ? `/almacen-virtual/edit/${warehouseId}`
      : `/almacen/edit/${warehouseId}`;
    navigate(path);
  };

  // Filtrar almacenes según la búsqueda
  const filteredPhysicalWarehouses = physicalWarehouses.filter((warehouse) =>
    warehouse.id?.toString().includes(searchId.trim())
  );

  const filteredVirtualWarehouses = virtualWarehouses.filter((warehouse) =>
    warehouse.id?.toString().includes(searchId.trim())
  );

  // Componente de tarjeta para almacén físico
  const PhysicalWarehouseCard = ({ warehouse }) => (
    <div className="warehouse-card">
      <Card
        id={warehouse.id}
        title={warehouse.name || "Almacén sin nombre"}
        description={`Ubicación: ${warehouse.location || "No especificada"}`}
      />
      <Button onClick={() => handleInspect(warehouse.id)} text="Inspeccionar" />
    </div>
  );

  // Componente de tarjeta para almacén virtual
  const VirtualWarehouseCard = ({ warehouse }) => (
    <div className="warehouse-card">
      <Card
        id={warehouse.id}
        title={warehouse.name || "Almacén Virtual"}
        description={`Productos: ${warehouse.products?.length || 0}`}
      />
      <Button
        onClick={() => handleInspect(warehouse.id, true)}
        text="Inspeccionar"
      />
    </div>
  );

  // Función para cambiar entre pestañas
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="management-container">
      <h1>Gestión de Almacenes</h1>

      {/* Pestañas */}
      <div className="tabs-container">
        <div
          className={`tab ${activeTab === "physical" ? "active" : ""}`}
          onClick={() => changeTab("physical")}
        >
          Almacenes Físicos
        </div>
        <div
          className={`tab ${activeTab === "virtual" ? "active" : ""}`}
          onClick={() => changeTab("virtual")}
        >
          Almacenes Virtuales
        </div>
      </div>

      {/* Filtro de búsqueda */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar por ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
      </div>

      {/* Contenido según la pestaña seleccionada */}
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
                  <PhysicalWarehouseCard
                    key={warehouse.id}
                    warehouse={warehouse}
                  />
                ))
              ) : (
                <p>No se encontraron almacenes físicos</p>
              )}
            </div>
          ) : (
            <div className="grid">
              {filteredVirtualWarehouses.length > 0 ? (
                filteredVirtualWarehouses.map((warehouse) => (
                  <VirtualWarehouseCard
                    key={warehouse.id}
                    warehouse={warehouse}
                  />
                ))
              ) : (
                <p>No se encontraron almacenes virtuales</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Management;
