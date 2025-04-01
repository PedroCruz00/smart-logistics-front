import { useState, useEffect } from "react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import Input from "../../components/input/Input";
import InputDD from "../../components/input/InputDD";
import Modal from "../../components/modal/Modal";
import Button from "../../components/button/Button";
import { getStoredData } from "../../data/getMasterData"; // Función que devuelve los productos precargados
import "./Home.css";

function Home() {
  // Estado para la opción de cargar productos ("Sí" o "No")
  const [selectedOption, setSelectedOption] = useState("No");
  const [storeName, setStoreName] = useState("");
  const [latitude, setLatitude] = useState("5.5351"); // Valor predeterminado para Colombia
  const [longitude, setLongitude] = useState("-73.3672"); // Valor predeterminado para Colombia
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [loadProductsModalOpen, setLoadProductsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 5.5351, lng: -73.3672 });

  // Al iniciar, verificamos si la API key está disponible
  useEffect(() => {
    // Check if API key is available
    if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      setApiKeyAvailable(true);
    } else {
      console.error("Google Maps API key not found in environment variables");
    }
    
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setLoadProductsModalOpen(true);
    }
  }, []);

  // Actualizar el centro del mapa cuando cambian latitud y longitud
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter({ lat, lng });
    }
  }, [latitude, longitude]);

  // Función para cargar productos desde localStorage
  const loadProducts = async () => {
    const storedProducts = getStoredData();
    setProducts(storedProducts);
    console.log("Productos cargados desde localStorage:", storedProducts);
    return Promise.resolve();
  };

  // Función para no cargar productos (vaciar el array)
  const doNotLoadProducts = async () => {
    setProducts([]);
    console.log("No se cargarán productos desde localStorage");
    return Promise.resolve();
  };

  // Función para manejar el arrastre del marcador
  const handleMarkerDrag = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    
    setLatitude(newLat.toFixed(6));
    setLongitude(newLng.toFixed(6));
    setMapCenter({ lat: newLat, lng: newLng });
  };

  // Función para enviar los datos del almacén junto con los productos (según la opción seleccionada)
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Obtener el token de autenticación desde localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/almacenes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Se envía el token en el header Authorization en formato Bearer
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storeName: storeName,
            location: {
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            },
            products: selectedOption === "Sí" ? products : [],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al crear tienda: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccessModalOpen(true);
      console.log("Tienda creada:", data);
    } catch (err) {
      setError("No se pudo crear la tienda. Intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  };

  return (
    <div className="home-container">
      <h2>Crear Nueva Tienda</h2>
      
      <div className="create-store-layout">
        {/* Formulario de creación de tienda */}
        <div className="form-section">
          <div className="form-content">
            <h3>Información de la Tienda</h3>
            
            <label htmlFor="storeName">Nombre de la tienda:</label>
            <Input
              className="input"
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />

            <label htmlFor="latitude">Latitud:</label>
            <Input
              className="input"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />

            <label htmlFor="longitude">Longitud:</label>
            <Input
              className="input"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />

            <label htmlFor="dropdown">¿Cargar productos precargados?</label>
            <InputDD
              options={["Sí", "No"]}
              value={selectedOption}
              onChange={(value) => setSelectedOption(value)}
            />

            <div className="products-info">
              <h4>Productos precargados: {products.length}</h4>
            </div>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Cargando..." : "Crear tienda"}
            </Button>

            {error && <p className="error">{error}</p>}
          </div>
        </div>

        {/* Mapa */}
        <div className="map-section">
          <h3>Ubicación en el Mapa</h3>
          <p className="map-instructions">Arrastra el marcador para seleccionar la ubicación exacta</p>
          <div className="map-container">
            {apiKeyAvailable ? (
              <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <div style={containerStyle}>
                  <Map
                    defaultCenter={mapCenter}
                    center={mapCenter}
                    defaultZoom={15}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <Marker 
                      position={mapCenter} 
                      draggable={true}
                      onDragEnd={handleMarkerDrag}
                    />
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
      </div>

      {/* Modal para preguntar si cargar productos precargados */}
      <Modal
        title="Cargar Productos"
        content="¿Desea cargar los productos precargados guardados en el sistema?"
        buttonLabel="Sí, cargar productos"
        onConfirm={() => {
          loadProducts();
          setLoadProductsModalOpen(false);
        }}
        onClose={() => {
          doNotLoadProducts();
          setLoadProductsModalOpen(false);
        }}
        open={loadProductsModalOpen}
      />

      {/* Modal de éxito */}
      <Modal
        title="Tienda Creada"
        content="¡La tienda ha sido creada exitosamente!"
        buttonLabel="Aceptar"
        onConfirm={() => {
          setSuccessModalOpen(false);
          return Promise.resolve();
        }}
        open={successModalOpen}
      />
    </div>
  );
}

export default Home;
