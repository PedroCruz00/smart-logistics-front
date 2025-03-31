import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import stores from "../../data/stores.json";
import Button from "../../components/button/Button";
import "./EditStore.css";

function EditStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");

  // Buscar la tienda
  const dataStore = stores.find((store) => store.id === id);

  // Manejar estados para los inputs editables
  const [title, setTitle] = useState(dataStore ? dataStore.title : "");
  const [description, setDescription] = useState(
    dataStore ? dataStore.description : ""
  );

  if (!dataStore) {
    return <h1>Store not found</h1>;
  }

  // Simular eliminación
  const handleDelete = () => {
    alert(`Store ${dataStore.id} has been deleted!`);
    navigate("/almacen");
  };

  return (
    <div className="edit-store-container">
      <h1>Manage Store {dataStore.id}</h1>

      {/* Pestañas */}
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
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === "edit" ? (
        <form className="edit-store-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      ) : (
        <div className="delete-confirmation">
          <p>
            ¿Estás seguro de que deseas eliminar la tienda{" "}
            <strong>{dataStore.title}</strong>?
          </p>
          <Button onClick={handleDelete} className="delete-button">
            Eliminar
          </Button>
        </div>
      )}
    </div>
  );
}

export default EditStore;
