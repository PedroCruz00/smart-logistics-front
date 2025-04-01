import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import Modal from "../../components/modal/Modal";
import "./EditStore.css";

// Funciones de autenticación
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

const redirectIfNotAuthenticated = (navigate) => {
  if (!isAuthenticated()) {
    navigate("/login", { replace: true });
    return false;
  }
  return true;
};

function EditStore() {
  const { id } = useParams(); // Recibe el ID del almacén de la URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");

  // Estado para almacenar la información del almacén
  const [store, setStore] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [products, setProducts] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idExists, setIdExists] = useState(false);

  // Para el formulario de producto
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  // Para el producto actual seleccionado (editar/eliminar)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isGenerateId, setIsGenerateId] = useState(true);

  // Verificar que la URL del backend existe
  const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";

  // Verificar autenticación al cargar
  useEffect(() => {
    if (!redirectIfNotAuthenticated(navigate)) return;
  }, [navigate]);

  // Cargar información del almacén
  useEffect(() => {
    if (!id || !isAuthenticated()) return;

    const fetchStoreDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/almacenes/${id}`, {
          headers: createAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Error fetching store: ${response.status}`);
        }

        const data = await response.json();
        setStore(data);
        setTitle(data.name || "");
        setDescription(data.location || "");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError("No se pudo cargar la información del almacén");
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [id, backendUrl, navigate]);

  // Cargar productos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/master-data/products`, {
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Received non-array data:", data);
        setProducts([]);
        setError("Formato de datos inesperado. Contacte al administrador.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos específicos del almacén
  const fetchStoreProducts = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/almacenes/${id}/productos`,
        {
          headers: createAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching store products: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setStoreProducts(data);
      } else {
        console.error("Received non-array data for store products:", data);
        setStoreProducts([]);
      }
    } catch (err) {
      console.error("Error fetching store products:", err);
      setError("Failed to load store products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products" && isAuthenticated()) {
      fetchProducts();
      fetchStoreProducts();
    }
  }, [activeTab, id]);

  // Verificar si el ID ya existe
  useEffect(() => {
    if (productForm.id && !selectedProduct) {
      const exists = products.some(
        (product) =>
          product.id && product.id.toString() === productForm.id.toString()
      );
      setIdExists(exists);
    } else {
      setIdExists(false);
    }
  }, [productForm.id, products, selectedProduct]);

  // Generar ID automático
  const generateId = () => {
    if (products.length === 0) return "1";

    try {
      // Encontrar el ID más alto y añadir 1
      const validIds = products
        .filter((product) => product.id !== undefined && product.id !== null)
        .map((product) =>
          typeof product.id === "number" ? product.id : parseInt(product.id, 10)
        )
        .filter((id) => !isNaN(id));

      if (validIds.length === 0) return "1";

      const maxId = Math.max(...validIds);
      return (maxId + 1).toString();
    } catch (err) {
      console.error("Error generating ID:", err);
      return Date.now().toString();
    }
  };

  // Manejar cambios en el formulario de producto
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;

    // Convertir a número para price y stock
    if (name === "price" || name === "stock") {
      setProductForm({
        ...productForm,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setProductForm({
        ...productForm,
        [name]: value,
      });
    }
  };

  // Crear un nuevo producto
  const createProduct = async () => {
    try {
      // Validar formulario
      if (
        !productForm.name ||
        !productForm.category ||
        productForm.price === "" ||
        productForm.stock === ""
      ) {
        setError("Todos los campos son obligatorios");
        return false;
      }

      if (idExists) {
        setError(
          "El ID ya existe. Por favor use otro ID o active la generación automática"
        );
        return false;
      }

      // Preparar el producto para enviar
      const productToCreate = {
        ...productForm,
        id: isGenerateId ? parseInt(generateId()) : parseInt(productForm.id),
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };

      console.log("Creando producto:", productToCreate);

      const response = await fetch(`${backendUrl}/api/master-data/products`, {
        method: "POST",
        headers: createAuthHeaders(),
        body: JSON.stringify(productToCreate),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response:", response.status, responseText);
        throw new Error(`Error creating product: ${response.status}`);
      }

      fetchProducts();
      setProductForm({ id: "", name: "", category: "", price: "", stock: "" });
      setError(null);
      return true;
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Error al crear el producto. Por favor intente nuevamente.");
      return false;
    }
  };

  // Actualizar un producto
  const updateProduct = async () => {
    if (!selectedProduct) return false;

    try {
      // Validar formulario
      if (
        !productForm.name ||
        !productForm.category ||
        productForm.price === "" ||
        productForm.stock === ""
      ) {
        setError("Todos los campos son obligatorios");
        return false;
      }

      // Preparar el producto para actualizar (manteniendo el ID original)
      const productId =
        typeof selectedProduct.id === "string"
          ? parseInt(selectedProduct.id)
          : selectedProduct.id;

      // Actualizar nombre
      await fetch(
        `${backendUrl}/api/master-data/products/${productId}/name?name=${encodeURIComponent(
          productForm.name
        )}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      // Actualizar categoría
      await fetch(
        `${backendUrl}/api/master-data/products/${productId}/category?category=${encodeURIComponent(
          productForm.category
        )}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      // Actualizar precio
      await fetch(
        `${backendUrl}/api/master-data/products/${productId}/price?price=${productForm.price}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      // Actualizar stock
      await fetch(
        `${backendUrl}/api/master-data/products/${productId}/stock?stock=${productForm.stock}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      fetchProducts();
      setProductForm({ id: "", name: "", category: "", price: "", stock: "" });
      setSelectedProduct(null);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error updating product:", err);
      setError(
        "Error al actualizar el producto. Por favor intente nuevamente."
      );
      return false;
    }
  };

  // Actualizar un atributo específico de un producto
  const updateProductAttribute = async (productId, attribute, value) => {
    try {
      console.log(`Actualizando ${attribute}:`, productId, value);

      const response = await fetch(
        `${backendUrl}/api/master-data/products/${productId}/${attribute}?${attribute}=${encodeURIComponent(
          value
        )}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response:", response.status, responseText);
        throw new Error(`Error updating ${attribute}: ${response.status}`);
      }

      fetchProducts();
      return true;
    } catch (err) {
      console.error(`Error updating ${attribute}:`, err);
      setError(
        `Error al actualizar ${attribute}. Por favor intente nuevamente.`
      );
      return false;
    }
  };

  // Eliminar un producto
  const deleteProduct = async () => {
    if (!selectedProduct) return false;

    try {
      console.log("Eliminando producto:", selectedProduct.id);

      const response = await fetch(
        `${backendUrl}/api/master-data/products/${selectedProduct.id}`,
        {
          method: "DELETE",
          headers: createAuthHeaders(),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response:", response.status, responseText);
        throw new Error(`Error deleting product: ${response.status}`);
      }

      fetchProducts();
      setSelectedProduct(null);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Error al eliminar el producto. Por favor intente nuevamente.");
      return false;
    }
  };

  // Manejar el submit del formulario de la tienda
  const handleSubmitStore = async (e) => {
    e.preventDefault();

    try {
      // Si ya existe el almacén, actualizarlo
      if (id) {
        // Implementar la lógica para actualizar el almacén
        // Aquí deberías hacer una llamada PUT al endpoint correcto
        // Por ahora solo mostramos alerta
        alert(`Store ${id} has been updated!`);
      } else {
        // Crear un nuevo almacén
        const response = await fetch(`${backendUrl}/api/almacenes`, {
          method: "POST",
          headers: createAuthHeaders(),
          body: JSON.stringify({
            name: title,
            location: description, // Asumiendo que description se usa como location
          }),
        });

        if (!response.ok) {
          throw new Error(`Error creating store: ${response.status}`);
        }

        alert("Store created successfully!");
        navigate("/almacen");
      }
    } catch (err) {
      console.error("Error saving store:", err);
      setError("Error al guardar la tienda. Por favor intente nuevamente.");
    }
  };

  // Manejar la eliminación de la tienda
  const handleDeleteStore = async () => {
    try {
      // Implementar la lógica para eliminar el almacén
      // Aquí deberías hacer una llamada DELETE al endpoint correcto

      // Por ahora solo mostramos alerta
      alert(`Store ${id} has been deleted!`);
      navigate("/almacen");
    } catch (err) {
      console.error("Error deleting store:", err);
      setError("Error al eliminar la tienda. Por favor intente nuevamente.");
    }
  };

  // Preparar para editar un producto
  const prepareEditProduct = (product) => {
    setSelectedProduct(product);
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    });
  };

  // Preparar para eliminar un producto
  const prepareDeleteProduct = (product) => {
    setSelectedProduct(product);
  };

  // Crear un nuevo producto (limpiar formulario)
  const prepareCreateProduct = () => {
    setSelectedProduct(null);
    setProductForm({ id: "", name: "", category: "", price: "", stock: "" });
    setIsGenerateId(true);
    setError(null);
  };

  // Manejar cambio en la generación automática de ID
  const handleGenerateIdChange = (e) => {
    const checked = e.target.checked;
    setIsGenerateId(checked);

    if (checked) {
      // Actualizar el ID con uno generado automáticamente
      setProductForm((prev) => ({
        ...prev,
        id: generateId(),
      }));
    }
  };

  // Solicitar al usuario un valor para actualizar un atributo
  const promptForAttributeUpdate = (product, attribute, currentValue) => {
    const attributeNames = {
      name: "nombre",
      category: "categoría",
      price: "precio",
      stock: "stock",
    };

    const newValue = prompt(
      `Ingrese el nuevo ${attributeNames[attribute] || attribute}:`,
      currentValue
    );

    if (newValue !== null) {
      if (
        (attribute === "price" || attribute === "stock") &&
        isNaN(Number(newValue))
      ) {
        alert("Por favor ingrese un valor numérico válido");
        return;
      }
      updateProductAttribute(product.id, attribute, newValue);
    }
  };

  if (loading) {
    return <div className="loading">Cargando información del almacén...</div>;
  }

  if (error && !store) {
    return <div className="error-container">{error}</div>;
  }

  if (!store && !loading) {
    return <h1>Almacén no encontrado</h1>;
  }

  // Renderizado del formulario de producto
  const renderProductForm = () => (
    <div className="product-form">
      <div className="form-group">
        <label htmlFor="id">ID:</label>
        <div className="id-input-group">
          <input
            type="text"
            id="id"
            name="id"
            value={
              isGenerateId && !selectedProduct ? "(Automático)" : productForm.id
            }
            onChange={handleProductFormChange}
            className="form-input"
            disabled={isGenerateId || selectedProduct}
          />
          {!selectedProduct && (
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="generateId"
                checked={isGenerateId}
                onChange={handleGenerateIdChange}
              />
              <label htmlFor="generateId">Generar automáticamente</label>
            </div>
          )}
        </div>
        {idExists && <div className="field-error">Este ID ya existe</div>}
      </div>
      <div className="form-group">
        <label htmlFor="name">Nombre:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={productForm.name}
          onChange={handleProductFormChange}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">Categoría:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={productForm.category}
          onChange={handleProductFormChange}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="price">Precio:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={productForm.price}
          onChange={handleProductFormChange}
          className="form-input"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="stock">Stock:</label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={productForm.stock}
          onChange={handleProductFormChange}
          className="form-input"
          min="0"
          required
        />
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );

  return (
    <div className="edit-store-container">
      <h1>Gestionar Almacén: {title}</h1>

      <div className="tabs">
        <button
          className={activeTab === "edit" ? "tab active" : "tab"}
          onClick={() => setActiveTab("edit")}
        >
          Editar
        </button>
        <button
          className={activeTab === "delete" ? "tab active" : "tab"}
          onClick={() => setActiveTab("delete")}
        >
          Eliminar
        </button>
        <button
          className={activeTab === "products" ? "tab active" : "tab"}
          onClick={() => setActiveTab("products")}
        >
          Productos
        </button>
      </div>

      {activeTab === "edit" ? (
        <form className="edit-store-form" onSubmit={handleSubmitStore}>
          <div className="form-group">
            <label htmlFor="title">Nombre:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Ubicación:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>
          <Button type="submit">Guardar</Button>
        </form>
      ) : activeTab === "delete" ? (
        <div className="delete-confirmation">
          <p>
            ¿Estás seguro de que deseas eliminar el almacén{" "}
            <strong>{title}</strong>?
          </p>
          <Button onClick={handleDeleteStore} className="delete-button">
            Eliminar
          </Button>
        </div>
      ) : (
        <div className="products-tab">
          <h2>Gestión de Productos</h2>

          {/* Modal para crear productos */}
          <Modal
            title="Crear Producto"
            content={renderProductForm()}
            buttonLabel="Crear Producto"
            onConfirm={createProduct}
            triggerButton={
              <Button className="create-button" onClick={prepareCreateProduct}>
                Crear Producto
              </Button>
            }
            onClose={() => {
              setProductForm({
                id: "",
                name: "",
                category: "",
                price: "",
                stock: "",
              });
              setError(null);
            }}
          />

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p>Cargando productos...</p>
          ) : (
            <>
              <h3>Todos los productos</h3>
              <ul className="product-list">
                {products.length === 0 ? (
                  <p>No hay productos disponibles</p>
                ) : (
                  products.map((product) => (
                    <li key={product.id} className="product-item">
                      <div className="product-info">
                        <span className="product-id">ID: {product.id}</span>
                        <span className="product-name">
                          Nombre: {product.name}
                          <Button
                            className="attribute-edit-button"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "name",
                                product.name
                              )
                            }
                          >
                            ✏️
                          </Button>
                        </span>
                        <span className="product-category">
                          Categoría: {product.category}
                          <Button
                            className="attribute-edit-button"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "category",
                                product.category
                              )
                            }
                          >
                            ✏️
                          </Button>
                        </span>
                        <span className="product-price">
                          Precio: ${product.price}
                          <Button
                            className="attribute-edit-button"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "price",
                                product.price
                              )
                            }
                          >
                            ✏️
                          </Button>
                        </span>
                        <span className="product-stock">
                          Stock: {product.stock}
                          <Button
                            className="attribute-edit-button"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "stock",
                                product.stock
                              )
                            }
                          >
                            📊
                          </Button>
                        </span>
                      </div>
                      <div className="product-actions">
                        {/* Modal para editar producto */}
                        <Modal
                          title="Editar Producto"
                          content={renderProductForm()}
                          buttonLabel="Guardar Cambios"
                          onConfirm={updateProduct}
                          triggerButton={
                            <Button
                              className="edit-button"
                              onClick={() => prepareEditProduct(product)}
                            >
                              ✏️
                            </Button>
                          }
                          onClose={() => {
                            setSelectedProduct(null);
                            setProductForm({
                              id: "",
                              name: "",
                              category: "",
                              price: "",
                              stock: "",
                            });
                            setError(null);
                          }}
                        />

                        {/* Modal para eliminar producto */}
                        <Modal
                          title="Eliminar Producto"
                          content={`¿Estás seguro de que deseas eliminar el producto ${product.name}?`}
                          buttonLabel="Eliminar"
                          onConfirm={deleteProduct}
                          triggerButton={
                            <Button
                              className="delete-button"
                              onClick={() => prepareDeleteProduct(product)}
                            >
                              🗑️
                            </Button>
                          }
                          onClose={() => {
                            setSelectedProduct(null);
                            setError(null);
                          }}
                        />
                      </div>
                    </li>
                  ))
                )}
              </ul>

              {/* Productos específicos del almacén */}
              <h3>Productos en este almacén</h3>
              <ul className="store-product-list">
                {storeProducts.length === 0 ? (
                  <p>No hay productos en este almacén</p>
                ) : (
                  storeProducts.map((product) => (
                    <li key={product.id} className="product-item">
                      <div className="product-info">
                        <span className="product-id">ID: {product.id}</span>
                        <span className="product-name">
                          Nombre: {product.name}
                        </span>
                        <span className="product-category">
                          Categoría: {product.category}
                        </span>
                        <span className="product-price">
                          Precio: ${product.price}
                        </span>
                        <span className="product-stock">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default EditStore;
