import { useState } from "react";
import Button from "../button/Button";
import "./Modal.css";

function Modal({
  title,
  content,
  buttonLabel,
  onConfirm,
  triggerButton,
  onClose,
}) {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
      setShow(false);
    } catch (error) {
      console.error("Error in confirmation action:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  return (
    <div className="modal-container">
      {/* Si se proporciona un botón personalizado para abrir el modal */}
      {triggerButton ? (
        <div onClick={() => setShow(true)}>{triggerButton}</div>
      ) : (
        /* Botón predeterminado para abrir el modal */
        <Button onClick={() => setShow(true)}>{buttonLabel}</Button>
      )}

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
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                {typeof content === "string" ? <p>{content}</p> : content}
              </div>
              <div className="modal-footer">
                <Button onClick={handleConfirm} disabled={saving}>
                  {saving ? "Guardando..." : "Confirmar"}
                </Button>
                <Button onClick={handleClose}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Modal;
