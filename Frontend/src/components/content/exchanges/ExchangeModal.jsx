import React from "react";
import { ListGroup, Modal, Button } from "react-bootstrap";

const ExchangeModal = ({ show, onHide, exchange }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString?.split(".")[0] || dateString);
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
        <Modal.Title>Canje ID#{exchange.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Fecha:</strong> {formatDateTime(exchange.date)}
        </p>
        <hr />
        <h5>Datos del Cliente</h5>
        <p>
          <strong>Nombre:</strong> {exchange.clientName}
        </p>
        <hr />
        <h5>Recompensa</h5>
        <ListGroup variant="flush">
          <ListGroup.Item className="bg-transparent text-white px-0">
            {exchange.rewardName}
            <div className="d-flex justify-content-between text-secondary">
              <span>Puntos usados:</span>
              <strong>{exchange.pointsUsed} Puntos</strong>
            </div>
          </ListGroup.Item>
        </ListGroup>
        {exchange.qrCodeBase64 && (
          <div className="text-center my-3">
            <h6>Código QR:</h6>
            <img
              src={`data:image/png;base64,${exchange.qrCodeBase64}`}
              alt={`QR Canje #${exchange.id}`}
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

export default ExchangeModal;
