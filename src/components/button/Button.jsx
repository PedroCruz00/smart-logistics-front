import "./Button.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Button({ children, onClick }) {
  return (
    <div className="mybutton">
      <button className="btn btn-outline-primary" onClick={onClick}>
        {children}
      </button>
    </div>
  );
}

export default Button;
