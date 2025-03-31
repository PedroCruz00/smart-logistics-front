import { useState } from "react";
import Card from "../../components/card/Card";
import "./Management.css";
import data from "../../data/stores.json";

function Management() {
  const [searchId, setSearchId] = useState("");
  const [cardData, setCardData] = useState(data);

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
