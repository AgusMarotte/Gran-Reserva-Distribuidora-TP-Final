import React, { useEffect, useState } from "react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");

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
            throw new Error("Error 401: No autorizado. Iniciá sesión nuevamente.");
          } else {
            throw new Error("Ocurrió un error al obtener tus órdenes.");
          }
        }

        const data = await response.json();
        console.log("Órdenes obtenidas:", data);

        // Ordenar de más reciente a más antigua
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // más reciente primero
        });

        setOrders(sortedData);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

      {error ? (
        <p className="text-danger">Error: {error}</p>
      ) : orders.length === 0 ? (
        <p>No tenés órdenes aún.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const formattedDateTime = formatDateTime(order.date);

            // Detecta el campo correcto donde vienen los productos
            const orderItems =
              order.orderDetails || order.items || order.products || [];

            return (
              <div
                key={order.id}
                className="card bg-dark text-white border-light"
                style={{ cursor: "pointer" }}
                onClick={() => toggleExpand(order.id)}
              >
                {/* Encabezado visible */}
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title mb-0">Orden #{order.id}</h5>
                    <small className="text-secondary">
                      Fecha: {formattedDateTime}
                    </small>
                  </div>
                  <h5 className="mb-0">
                    $
                    {order.total?.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </h5>
                </div>

                {/* Sección expandible */}
                {expandedOrder === order.id && (
                  <div className="card-footer bg-secondary text-light">
                    <p className="mb-2">
                      <strong>Estado:</strong> {order.state}
                    </p>
                    <h6>Productos:</h6>
                    <ul className="mb-0">
                      {orderItems.length > 0 ? (
                        orderItems.map((detail, idx) => {
                          const nombre =
                            detail.productName ||
                            detail.name ||
                            "Producto sin nombre";
                          const cantidad =
                            detail.amount || detail.quantity || 1;
                          const precio =
                            detail.unitaryPrice ||
                            detail.unitPrice ||
                            detail.price ||
                            0;
                          const subtotal = precio * cantidad;

                          return (
                            <li key={idx}>
                              {nombre} — $
                              {precio.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              c/u × {cantidad} ={" "}
                              <strong>
                                $
                                {subtotal.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </strong>
                            </li>
                          );
                        })
                      ) : (
                        <li>No hay productos en esta orden.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
