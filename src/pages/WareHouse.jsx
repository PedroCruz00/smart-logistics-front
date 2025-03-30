import React from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function AlmacenDetail() {
  const { id } = useParams();
  
  // Estos valores deberían venir de una API basada en el ID del almacén
  // Por ahora usamos valores de ejemplo
  const almacenData = {
    id: id,
    nombre: `Almacén ${id}`,
    descripcion: "Descripción detallada del almacén",
    ubicacion: {
      lat: 5.5351, // Coordenadas de ejemplo (Colombia)
      lng: -73.3672
    }
  };

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  return (
    <div className="almacen-detail-container">
      <h2>Detalles del Almacén {id}</h2>
      <div className="almacen-info">
        <h3>{almacenData.nombre}</h3>
        <p>{almacenData.descripcion}</p>
      </div>
      
      <div className="map-container">
        <h4>Ubicación</h4>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={almacenData.ubicacion}
            zoom={15}
          >
            <Marker position={almacenData.ubicacion} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default AlmacenDetail;