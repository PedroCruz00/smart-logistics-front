import "./Button.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Button({ children, onClick }) {
  return (
    <button className="btn btn-outline-primary" onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
