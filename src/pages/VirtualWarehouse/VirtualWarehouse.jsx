import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./VirtualWarehouse.css";

function VirtualWarehouse() {
  const location = useLocation();
  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si los datos vienen en el estado de navegación
    if (location.state?.virtualWarehouse) {
      const virtualData = location.state.virtualWarehouse;
      setWarehouse(virtualData);
      setProducts(virtualData.products || []);
      setLoading(false);
      return;
    }

    // Si no hay datos en el estado, hacer la petición al API
    const fetchWarehouseData = async () => {
      const API_URL = process.env.REACT_APP_API_URL;

      if (!API_URL) {
        console.error(
          "❌ ERROR: La variable de entorno REACT_APP_API_URL no está definida."
        );
        setError("Error: Backend URL no está configurado.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No hay token de autenticación.");
        }

        // Obtener información del almacén virtual (sin ID)
        const response = await fetch(`${API_URL}/almacen-virtual`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Error al obtener información del almacén virtual: ${response.status}`
          );
        }

        const data = await response.json();
        setWarehouse(data);
        setProducts(data.products || []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, [location.state]);

  // Función para formatear el precio
  const formatPrice = (price) => {
    return price.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  return (
    <div className="virtual-warehouse-container">
      {loading ? (
        <div className="loading">
          Cargando información del almacén virtual...
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="warehouse-info-card">
            <h3>{warehouse?.name || "Almacén sin nombre"}</h3>
            <p>
              <strong>ID:</strong> {warehouse?.id}
            </p>
            <p>
              <strong>Total de productos:</strong> {products.length}
            </p>
          </div>

          <h3>Productos en inventario</h3>

          {products.length === 0 ? (
            <div className="no-products">
              Este almacén virtual no tiene productos registrados.
            </div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VirtualWarehouse;
