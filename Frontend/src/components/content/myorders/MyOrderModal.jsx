import React from "react";
import { ListGroup, Modal, Button } from "react-bootstrap";

const MyOrderModal = ({ show, onHide, order }) => {
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

  if (!order) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered data-bs-theme="dark">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de la Orden ID#{order.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-1">
          <strong>Fecha:</strong> {formatDateTime(order.date)}
        </p>
        <p className="mb-1">
          <strong>Estado:</strong> {order.state}
        </p>
        <p>
          <strong>Puntos Ganados:</strong>{" "}
          {order.pointsEarned || order.total * 0.01}
        </p>

        <h6 className="mt-4">Productos:</h6>
        <ListGroup variant="flush">
          {order.orderDetails?.length > 0 ? (
            order.orderDetails.map((detail, idx) => {
              const nombre = detail.productName || "Producto sin nombre";
              const cantidad = detail.amount || 1;
              const precio = detail.unitaryPrice || 0;
              const subtotal = precio * cantidad;

              return (
                <ListGroup.Item
                  key={idx}
                  className="bg-transparent text-white px-0"
                >
                  {nombre}
                  <div className="d-flex justify-content-between text-secondary">
                    <span>
                      $
                      {precio.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      c/u x {cantidad}
                    </span>
                    <strong>
                      $
                      {subtotal.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </ListGroup.Item>
              );
            })
          ) : (
            <ListGroup.Item className="bg-transparent text-white px-0">
              No hay productos en esta orden.
            </ListGroup.Item>
          )}
        </ListGroup>

        {order.qrCodeBase64 && (
          <div className="text-center my-3">
            <h6>Código QR:</h6>
            <img
              src={`data:image/png;base64,${order.qrCodeBase64}`}
              alt={`Código QR para Orden #${order.id}`}
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
          <h5 className="mb-0">
            Total: $
            {order.total?.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </h5>
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

export default MyOrderModal;
