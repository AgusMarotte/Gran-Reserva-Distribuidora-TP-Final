import React from "react";
import { Modal, Button } from "react-bootstrap";

const MyExchangeModal = ({ show, onHide, exchange }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!exchange) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered data-bs-theme="dark">
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Canje ID#{exchange.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-1">
          <strong>Recompensa:</strong> {exchange.rewardName}
        </p>
        <p className="mb-1">
          <strong>Fecha:</strong> {formatDateTime(exchange.date)}
        </p>

        {exchange.qrCodeBase64 && (
          <div className="text-center my-4">
            <h6>Código QR:</h6>
            <img
              src={`data:image/png;base64,${exchange.qrCodeBase64}`}
              alt={`Código QR para Canje #${exchange.id}`}
              style={{
                width: "150px",
                height: "150px",
                background: "white",
                padding: "5px",
              }}
            />
          </div>
        )}

        <hr className="my-2" />
        <div className="d-flex justify-content-end">
          <h5 className="mb-0">Total: {exchange.pointsUsed} Puntos</h5>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MyExchangeModal;
