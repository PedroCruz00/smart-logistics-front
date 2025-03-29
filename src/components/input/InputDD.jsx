import { useState } from "react";

function InputDD({ options, value, onChange }) {
  const [selected, setSelected] = useState(value || "Seleccionar");
  const [isOpen, setIsOpen] = useState(false); // Estado para mostrar/ocultar dropdown

  const handleSelect = (option) => {
    setSelected(option);
    if (onChange) onChange(option);
    setIsOpen(false); // Ocultar dropdown al seleccionar
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)} // Manejar visibilidad manualmente
      >
        {selected}
      </button>
      {isOpen && ( // Mostrar opciones solo cuando isOpen es true
        <ul className="dropdown-menu show">
          {options.map((option, index) => (
            <li key={index}>
              <button
                className="dropdown-item"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InputDD;
