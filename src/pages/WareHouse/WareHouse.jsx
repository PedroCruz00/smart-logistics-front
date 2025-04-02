import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import Button from '../../components/button/Button';
import './WareHouse.css';

function WareHouse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar API key de Google Maps
    if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setApiKeyAvailable(true);
    } else {
      console.error("Google Maps API key not found in environment variables");
    }

    // Cargar datos del almacén
    const fetchWarehouseData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No hay token de autenticación");

        const response = await fetch(`${process.env.REACT_APP_API_URL}/almacenes/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener datos del almacén: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos del almacén recibidos:', data);
        setWarehouse(data);
      } catch (err) {
        console.error('Error fetching warehouse:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, [id]);

  const containerStyle = {
    width: '100%',
    height: '400px',
    border: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  };

  if (loading) {
    return (
      <div className="warehouse-detail-container">
        <div className="loading">Cargando información del almacén...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="warehouse-detail-container">
        <div className="error-message">{error}</div>
        <Button onClick={() => navigate('/management')}>Volver a Gestión</Button>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="warehouse-detail-container">
        <div className="error-message">No se encontró el almacén</div>
        <Button onClick={() => navigate('/management')}>Volver a Gestión</Button>
      </div>
    );
  }

  return (
    <div className="warehouse-detail-container">
      <div className="warehouse-header">
        <h2>{warehouse.name || `Almacén ${id}`}</h2>
        <Button onClick={() => navigate('/management')}>Volver a Gestión</Button>
      </div>

      <div className="warehouse-info">
        <div className="info-section">
          <h3>Información General</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>ID:</label>
              <span>{warehouse.id}</span>
            </div>
            <div className="info-item">
              <label>Nombre:</label>
              <span>{warehouse.name}</span>
            </div>
            <div className="info-item">
              <label>Ubicación:</label>
              <span>{warehouse.location}</span>
            </div>
            <div className="info-item">
              <label>Descripción:</label>
              <span>{warehouse.description || 'Sin descripción'}</span>
            </div>
          </div>
        </div>

        {warehouse.products && warehouse.products.length > 0 && (
          <div className="info-section">
            <h3>Productos ({warehouse.products.length})</h3>
            <div className="products-grid">
              {warehouse.products.map((product) => (
                <div key={product.id} className="product-item">
                  <h4>{product.name}</h4>
                  <p>Categoría: {product.category}</p>
                  <p>Precio: ${product.price}</p>
                  <p>Stock: {product.stock}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="map-section">
        <h3>Ubicación en el Mapa</h3>
        {apiKeyAvailable && warehouse.coordinates ? (
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <div style={containerStyle}>
              <Map
                defaultCenter={{
                  lat: warehouse.coordinates.latitude,
                  lng: warehouse.coordinates.longitude
                }}
                defaultZoom={15}
                mapId={process.env.REACT_APP_GOOGLE_MAPS_ID || 'default-map-id'}
              >
                <AdvancedMarker
                  position={{
                    lat: warehouse.coordinates.latitude,
                    lng: warehouse.coordinates.longitude
                  }}
                >
                  <div className="property">
                    <div className="icon">
                      <i className="fas fa-warehouse"></i>
                    </div>
                  </div>
                </AdvancedMarker>
              </Map>
            </div>
          </APIProvider>
        ) : (
          <div style={containerStyle}>
            {!apiKeyAvailable ? (
              <p>No se puede cargar el mapa: Falta la clave API de Google Maps</p>
            ) : (
              <p>No hay coordenadas disponibles para este almacén</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WareHouse;