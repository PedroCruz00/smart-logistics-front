import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import './WareHouse.css';

function WareHouse() {
  const { id } = useParams();
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);

  useEffect(() => {
    // Check if API key is available
    if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setApiKeyAvailable(true);
    } else {
      console.error("Google Maps API key not found in environment variables");
    }
  }, []);

  // These values should come from an API based on the warehouse ID
  // For now we use sample values
  const warehouseData = {
    id: id,
    name: `Warehouse ${id}`,
    description: "Information of the warehouse",
    location: {
      lat: 5.5351, // Sample coordinates (Colombia)
      lng: -73.3672
    }
  };

  const containerStyle = {
    width: '100%',
    height: '400px',
    border: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  };

  return (
    <div className="warehouse-detail-container">
      <h2>Warehouse Details {id}</h2>
      <div className="warehouse-info">
        <h3>{warehouseData.name}</h3>
        <p>{warehouseData.description}</p>
      </div>
      
      <div className="map-container">
        <h4>Location</h4>
        {apiKeyAvailable ? (
          <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <div style={containerStyle}>
              <Map
                defaultCenter={warehouseData.location}
                defaultZoom={15}
                mapId={process.env.REACT_APP_GOOGLE_MAPS_ID || 'default-map-id'}
              >
                <AdvancedMarker position={warehouseData.location} />
              </Map>
            </div>
          </APIProvider>
        ) : (
          <div style={containerStyle}>
            <p>No se puede cargar el mapa: Falta la clave API de Google Maps</p>
            <p>Configura REACT_APP_GOOGLE_MAPS_API_KEY en el archivo .env</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WareHouse;