import { useState } from "react";
import Card from "../components/card/Card";
import Input from "../components/input/Input";
import "./Management.css";

function Management() {
  const [searchId, setSearchId] = useState(""); // Estado para filtrar por ID

  const cardData = [
    { id: "0001", title: "Nuevo Colón", description: "No hay descripción" },
    {
      id: "0002",
      title: "Antiguo Colón",
      description: "Descripción detallada",
    },
    { id: "0003", title: "Centro", description: "En el centro de la ciudad" },
    { id: "0004", title: "Zona Norte", description: "Zona moderna" },
    { id: "0005", title: "Playa", description: "Cerca del mar" },
    { id: "0006", title: "Montaña", description: "Vista espectacular" },
  ];

  // Filtramos las tarjetas por ID
  const filteredCards = cardData.filter((card) =>
    card.id.includes(searchId.trim())
  );

  return (
    <div className="management-container">
      <h1>Management</h1>

      <div className="filter-container">
        <h3>Filter by ID:</h3>
        <input
          type="text"
          placeholder="Ingrese ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
      </div>

      <div className="grid">
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              title={card.title}
              description={card.description}
            />
          ))
        ) : (
          <p>No se encontraron resultados</p>
        )}
      </div>
    </div>
  );
}

export default Management;
