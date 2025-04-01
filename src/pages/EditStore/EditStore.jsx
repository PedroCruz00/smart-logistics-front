import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import stores from "../../data/stores.json";
import Button from "../../components/button/Button";
import Modal from "../../components/modal/Modal";
import "./EditStore.css";

function EditStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");

  // Buscar la tienda
  const dataStore = stores.find((store) => store.id === id);
  const [title, setTitle] = useState(dataStore ? dataStore.title : "");
  const [description, setDescription] = useState(
    dataStore ? dataStore.description : ""
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Cargar productos
  const fetchProducts = () => {
    setLoading(true);
    fetch(`${backendUrl}/api/master-data/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Error fetching products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Received non-array data:", data);
          setProducts([]);
          setError("Formato de datos inesperado. Contacte al administrador.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab]);

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
        headers: {
          "Content-Type": "application/json",
        },
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
      const productToUpdate = {
        ...productForm,
        id:
          typeof selectedProduct.id === "string"
            ? parseInt(selectedProduct.id)
            : selectedProduct.id,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };

      console.log("Actualizando producto:", productToUpdate);

      const response = await fetch(
        `${backendUrl}/api/master-data/products/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productToUpdate),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response:", response.status, responseText);
        throw new Error(`Error updating product: ${response.status}`);
      }

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

  // Actualizar sólo el stock de un producto
  const updateProductStock = async (productId, newStock) => {
    try {
      console.log("Actualizando stock:", productId, newStock);

      // Obtener el producto actual primero
      const product = products.find(
        (p) => p.id.toString() === productId.toString()
      );
      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // Preparar el objeto completo para enviar
      const updatedProduct = {
        ...product,
        stock: newStock,
      };

      const response = await fetch(
        `${backendUrl}/api/master-data/products/${productId}/stock?stock=${newStock}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        console.error("Error response:", response.status, responseText);
        throw new Error(`Error updating stock: ${response.status}`);
      }

      fetchProducts();
      return true;
    } catch (err) {
      console.error("Error updating stock:", err);
      setError("Error al actualizar el stock. Por favor intente nuevamente.");
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
  const handleSubmitStore = (e) => {
    e.preventDefault();
    alert(`Store ${dataStore.id} has been updated!`);
    // Aquí iría la lógica para actualizar la tienda
  };

  // Manejar la eliminación de la tienda
  const handleDeleteStore = () => {
    alert(`Store ${dataStore.id} has been deleted!`);
    navigate("/almacen");
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

  if (!dataStore) {
    return <h1>Store not found</h1>;
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
      <h1>Manage Store {dataStore.id}</h1>

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
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      ) : activeTab === "delete" ? (
        <div className="delete-confirmation">
          <p>
            ¿Estás seguro de que deseas eliminar la tienda{" "}
            <strong>{dataStore.title}</strong>?
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
                      </span>
                      <span className="product-category">
                        Categoría: {product.category}
                      </span>
                      <span className="product-price">
                        Precio: ${product.price}
                      </span>
                      <span className="product-stock">
                        Stock: {product.stock}
                        <Button
                          className="stock-edit-button"
                          onClick={() => {
                            const newStock = prompt(
                              "Ingrese el nuevo stock:",
                              product.stock
                            );
                            if (newStock !== null && !isNaN(Number(newStock))) {
                              updateProductStock(product.id, Number(newStock));
                            }
                          }}
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
          )}
        </div>
      )}
    </div>
  );
}

export default EditStore;
