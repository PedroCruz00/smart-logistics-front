import "./Input.css";

function Input({ label, value, onChange, className, id, type = "text", placeholder }) {
  return (
    <div className="input-container">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <input
        type={type}
        className={`form-control ${className || ''}`}
        value={value}
        onChange={onChange}
        id={id}
        placeholder={placeholder}
      />
    </div>
  );
}

export default Input;
