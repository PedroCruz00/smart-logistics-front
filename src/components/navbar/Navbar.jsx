import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../services/UserContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import logo from "./assets/logo.png";

function Navbar() {
  const { user, logoutUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" width="50" height="50" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/management")}`}
                to="/management"
              >
                Management
              </Link>
            </li>
            {user && user.role === "SUPER_ADMIN" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/settings")}`}
                  to="/settings"
                >
                  Settings
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            <span className="navbar-text me-3">
              {user
                ? `${user.name || user.displayName} (${user.role})`
                : "Cargando..."}
            </span>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
