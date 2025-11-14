import React, { useEffect, useState } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import MyOrderModal from "./MyOrderModal";

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

      <MyOrderModal
        show={showModal}
        onHide={handleCloseModal}
        order={selectedOrder}
      />
    </div>
  );
};

export default MyOrders;
