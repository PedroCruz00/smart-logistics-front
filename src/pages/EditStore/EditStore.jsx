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

function ManageStore() {
  const { id } = useParams(); // Recibe el ID del almacén de la URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  // Estado para almacenar la información del almacén
  const [store, setStore] = useState(null);
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
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
  const apiUrl = process.env.REACT_APP_API_URL || `${backendUrl}/api`;

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
        const response = await fetch(`${apiUrl}/almacenes/${id}`, {
          headers: createAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Error fetching store: ${response.status}`);
        }

        const data = await response.json();
        setStore(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError("No se pudo cargar la información del almacén");
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [id, apiUrl, navigate]);

  // Cargar productos maestros
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/master-data/products`, {
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
      setError("No se pudieron cargar los productos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos específicos del almacén
  const fetchStoreProducts = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/almacenes/${id}/productos`, {
        headers: createAuthHeaders(),
      });

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
      setError(
        "No se pudieron cargar los productos del almacén. Intente nuevamente."
      );
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

      const response = await fetch(`${apiUrl}/master-data/products`, {
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
        `${apiUrl}/master-data/products/${productId}/name?name=${encodeURIComponent(
          productForm.name
        )}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      // Actualizar categoría
      await fetch(
        `${apiUrl}/master-data/products/${productId}/category?category=${encodeURIComponent(
          productForm.category
        )}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      // Actualizar precio
      await fetch(
        `${apiUrl}/master-data/products/${productId}/price?price=${productForm.price}`,
        {
          method: "PUT",
          headers: createAuthHeaders(),
        }
      );

      // Actualizar stock
      await fetch(
        `${apiUrl}/master-data/products/${productId}/stock?stock=${productForm.stock}`,
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
        `${apiUrl}/master-data/products/${productId}/${attribute}?${attribute}=${encodeURIComponent(
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
        `${apiUrl}/master-data/products/${selectedProduct.id}`,
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

  // Manejar la eliminación de la tienda
  const handleDeleteStore = async () => {
    try {
      const confirmation = window.confirm(
        `¿Estás seguro de que deseas eliminar el almacén ${store.name}?`
      );

      if (!confirmation) return;

      const response = await fetch(`${apiUrl}/almacenes/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error deleting store: ${response.status}`);
      }

      alert(`Almacén ${store.name} ha sido eliminado exitosamente.`);
      navigate("/management");
    } catch (err) {
      console.error("Error deleting store:", err);
      setError("Error al eliminar el almacén. Por favor intente nuevamente.");
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

  if (loading && !store) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del almacén...</p>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <Button onClick={() => navigate("/management")}>
          Volver a almacenes
        </Button>
      </div>
    );
  }

  if (!store && !loading) {
    return (
      <div className="not-found-container">
        <h1>Almacén no encontrado</h1>
        <Button onClick={() => navigate("/management")}>
          Volver a almacenes
        </Button>
      </div>
    );
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
    <div className="manage-store-container">
      <div className="store-header">
        <h1>{store.name}</h1>
        <p className="store-location">Ubicación: {store.location}</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "products" ? "tab active" : "tab"}
          onClick={() => setActiveTab("products")}
        >
          Productos
        </button>
        <button
          className={activeTab === "delete" ? "tab active" : "tab"}
          onClick={() => setActiveTab("delete")}
        >
          Eliminar Almacén
        </button>
      </div>

      {activeTab === "delete" ? (
        <div className="delete-confirmation">
          <div className="alert alert-danger">
            <h3>Confirmar Eliminación</h3>
            <p>
              ¿Estás seguro de que deseas eliminar el almacén{" "}
              <strong>{store.name}</strong>?
            </p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="action-buttons">
              <Button onClick={() => setActiveTab("products")}>Cancelar</Button>
              <Button onClick={handleDeleteStore} className="delete-button">
                Eliminar Almacén
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="products-tab">
          <div className="section-header">
            <h2>Gestión de Productos</h2>
            <Modal
              title="Crear Producto"
              content={renderProductForm()}
              buttonLabel="Crear Producto"
              onConfirm={createProduct}
              triggerButton={
                <Button
                  className="create-button"
                  onClick={prepareCreateProduct}
                >
                  + Nuevo Producto
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
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="products-section">
            <h3>Productos en este almacén</h3>
            {loading ? (
              <div className="loading-spinner-small"></div>
            ) : storeProducts.length === 0 ? (
              <div className="empty-state">
                <p>No hay productos en este almacén</p>
                <p className="suggestion-text">
                  Puedes añadir productos desde el catálogo maestro.
                </p>
              </div>
            ) : (
              <div className="product-cards">
                {storeProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-card-header">
                      <h4>{product.name}</h4>
                      <span className="product-id">ID: {product.id}</span>
                    </div>
                    <div className="product-card-body">
                      <p className="product-category">
                        Categoría: {product.category}
                      </p>
                      <p className="product-price">
                        Precio: ${product.price.toFixed(2)}
                      </p>
                      <p className="product-stock">
                        Stock: {product.stock} unidades
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="products-section">
            <h3>Catálogo Maestro de Productos</h3>
            {loading ? (
              <div className="loading-spinner-small"></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p>No hay productos disponibles en el catálogo</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          {product.name}
                          <button
                            className="action-button small"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "name",
                                product.name
                              )
                            }
                            title="Editar nombre"
                          >
                            ✏️
                          </button>
                        </td>
                        <td>
                          {product.category}
                          <button
                            className="action-button small"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "category",
                                product.category
                              )
                            }
                            title="Editar categoría"
                          >
                            ✏️
                          </button>
                        </td>
                        <td>
                          ${product.price.toFixed(2)}
                          <button
                            className="action-button small"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "price",
                                product.price
                              )
                            }
                            title="Editar precio"
                          >
                            ✏️
                          </button>
                        </td>
                        <td>
                          {product.stock}
                          <button
                            className="action-button small"
                            onClick={() =>
                              promptForAttributeUpdate(
                                product,
                                "stock",
                                product.stock
                              )
                            }
                            title="Editar stock"
                          >
                            📊
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Modal
                              title="Editar Producto"
                              content={renderProductForm()}
                              buttonLabel="Guardar Cambios"
                              onConfirm={updateProduct}
                              triggerButton={
                                <button
                                  className="action-button"
                                  onClick={() => prepareEditProduct(product)}
                                  title="Editar producto"
                                >
                                  ✏️
                                </button>
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

                            <Modal
                              title="Eliminar Producto"
                              content={`¿Estás seguro de que deseas eliminar el producto ${product.name}?`}
                              buttonLabel="Eliminar"
                              onConfirm={deleteProduct}
                              triggerButton={
                                <button
                                  className="action-button delete"
                                  onClick={() => prepareDeleteProduct(product)}
                                  title="Eliminar producto"
                                >
                                  🗑️
                                </button>
                              }
                              onClose={() => {
                                setSelectedProduct(null);
                                setError(null);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bottom-navigation">
        <Button
          onClick={() => navigate("/management")}
          className="secondary-button"
        >
          Volver a Almacenes
        </Button>
      </div>
    </div>
  );
}

export default ManageStore;
