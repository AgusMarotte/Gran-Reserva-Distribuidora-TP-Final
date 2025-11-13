import React, { useEffect, useState } from "react";
import { ListGroup, Modal, Button, Spinner } from "react-bootstrap";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No se encontró el token de autenticación.");
          return;
        }

        const response = await fetch(
          "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Order/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Error 401: No autorizado. Iniciá sesión nuevamente."
            );
          } else {
            throw new Error("Ocurrió un error al obtener tus órdenes.");
          }
        }

        const data = await response.json();
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        setOrders(sortedData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

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

  return (
    <div className="container text-white py-5">
      <h2 className="mb-4 fw-bold">Mis Órdenes</h2>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando tus órdenes...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">Error: {error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <p>No tenés órdenes aún.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <ListGroup>
          {orders.map((order) => (
            <ListGroup.Item
              key={order.id}
              action
              onClick={() => handleShowModal(order)}
              className="bg-dark text-white border-secondary mb-2 rounded"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Orden ID#{order.id}</h5>
                  <small className="text-secondary">
                    {formatDateTime(order.date)}
                  </small>
                </div>
                <h5 className="mb-0">
                  $
                  {order.total?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </h5>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {selectedOrder && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          data-bs-theme="dark"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Detalles de la Orden ID#{selectedOrder.id}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-1">
              <strong>Fecha:</strong> {formatDateTime(selectedOrder.date)}
            </p>
            <p className="mb-1">
              <strong>Estado:</strong> {selectedOrder.state}
            </p>
            <p>
              <strong>Puntos Ganados:</strong>{" "}
              {selectedOrder.pointsEarned || selectedOrder.total * 0.01}
            </p>

            <h6 className="mt-4">Productos:</h6>
            <ListGroup variant="flush">
              {selectedOrder.orderDetails?.length > 0 ? (
                selectedOrder.orderDetails.map((detail, idx) => {
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

            {selectedOrder.qrCodeBase64 && (
              <div className="text-center my-3">
                <h6>Código QR:</h6>
                <img
                  src={`data:image/png;base64,${selectedOrder.qrCodeBase64}`}
                  alt={`Código QR para Orden #${selectedOrder.id}`}
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
                {selectedOrder.total?.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </h5>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default MyOrders;
