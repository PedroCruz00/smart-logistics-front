import { Link } from "react-router-dom";
import "./WarehouseCard.css";
import Button from "../button/Button";

function WarehouseCard({ id, title, description }) {
  let cardTitle = title || "Warehouse title";
  let cardDescription =
    description || "Some quick example text about this warehouse.";

  return (
    <div className="warehouse-card">
      <div className="warehouse-card-header">Store {id}</div>
      <div className="warehouse-card-body">
        <h5 className="warehouse-card-title">{cardTitle}</h5>
        <p className="warehouse-card-text">{cardDescription}</p>

        <Link to={`/almacen-virtual`}>
          <Button className="button">Inspect</Button>
        </Link>
      </div>
      <div className="warehouse-card-footer">2 days ago</div>
    </div>
  );
}

export default WarehouseCard;
