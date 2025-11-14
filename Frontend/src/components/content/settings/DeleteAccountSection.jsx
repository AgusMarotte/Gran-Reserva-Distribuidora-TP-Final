import { useState } from "react";
import { Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_DELETE_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User?permanently=false";

const DeleteAccountSection = ({ onLogin }) => {
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_DELETE_URL, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = "Error al eliminar la cuenta.";
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          errorMsg = errorText || "Error desconocido.";
        }
        throw new Error(errorMsg);
      }

      toast.success("Tu cuenta ha sido eliminada correctamente.");
      setShowDeleteModal(false);
      onLogin(null, false);
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Error al eliminar la cuenta.");
      setSaving(false);
    }
  };

  return (
    <>
      <hr className="my-4" />
      <Row className="justify-content-center">
        <Col md={6}>
          <h5 className="mb-3 text-danger">Zona de Peligro</h5>
          <p className="text-secondary">
            Esta acción dará de baja tu cuenta y no podrás acceder a ella.
          </p>
          <div className="d-grid">
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={saving}
            >
              Eliminar mi cuenta
            </Button>
          </div>
        </Col>
      </Row>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        data-bs-theme="dark"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación de Cuenta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar tu cuenta?</p>
          <p className="text-warning">
            Perderás acceso a tu historial de pedidos, tus puntos acumulados y
            la posibilidad de realizar compras.
          </p>
          <p className="text-danger fw-bold">Esta acción es definitiva.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={saving}
          >
            {saving ? "Eliminando..." : "Sí, eliminar mi cuenta"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteAccountSection;
