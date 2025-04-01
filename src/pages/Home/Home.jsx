import { useState, useEffect } from "react";
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
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [loadProductsModalOpen, setLoadProductsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Al iniciar, si hay productos precargados en localStorage, se abre el modal para preguntar si cargarlos
  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setLoadProductsModalOpen(true);
    }
  }, []);

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
            address: address,
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

  return (
    <>
      <h3>Crear Tienda:</h3>

      <label htmlFor="dropdown">¿Cargar productos precargados?</label>
      <InputDD
        options={["Sí", "No"]}
        value={selectedOption}
        onChange={(value) => setSelectedOption(value)}
      />

      <label htmlFor="storeName">Nombre de la tienda:</label>
      <Input
        className="input"
        id="storeName"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
      />

      <label htmlFor="address">Dirección:</label>
      <Input
        className="input"
        id="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <div className="products-info">
        <h4>Productos precargados: {products.length}</h4>
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Cargando..." : "Crear tienda"}
      </Button>

      {error && <p className="error">{error}</p>}

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
    </>
  );
}

export default Home;
