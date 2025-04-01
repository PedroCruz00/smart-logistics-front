import "./Input.css";

function Input({ label, value, onChange }) {
  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <input
        type="text"
        className="form-control"
        value={value} // Ahora el valor del input es dinámico
        onChange={onChange} // Permite actualizar el estado en Settings.js
      />
    </div>
  );
}

export default Input;
