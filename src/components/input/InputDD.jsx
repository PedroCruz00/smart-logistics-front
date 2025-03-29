import { useState } from "react";

function InputDD({ options, value, onChange }) {
  const [selected, setSelected] = useState(value || "Seleccionar");

  const handleSelect = (option) => {
    setSelected(option);
    if (onChange) onChange(option);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {selected}
      </button>
      <ul className="dropdown-menu">
        {options.map((option, index) => (
          <li key={index}>
            <button className="dropdown-item" onClick={() => handleSelect(option)}>
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InputDD;
