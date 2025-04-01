import { useState } from "react";
import Button from "../button/Button";
import "./Modal.css";

function Modal({ title, content, buttonLabel }) {
  const [show, setShow] = useState(false);

  return (
    <div className="modal-container">
      {/* Botón para abrir el modal */}
      <Button onClick={() => setShow(true)}>{buttonLabel}</Button>

      {/* Modal */}
      {show && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{content}</p>
              </div>
              <div className="modal-footer">
                <Button onClick={() => setShow(false)}>Ok</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Modal;
