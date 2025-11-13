import { useEffect, useState } from "react";
import {
  ListGroup,
  Modal,
  Button,
  Spinner,
  Form,
  ToggleButton,
  ButtonGroup,
  Col,
} from "react-bootstrap";
import "./Orders.css";

const API_ORDER_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Order";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró el token de autenticación.");
          setLoading(false);
          return;
        }
        const response = await fetch(API_ORDER_URL, {
          headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
        });
        if (!response.ok) throw new Error("Error al obtener las órdenes.");
        const data = await response.json();
        const sortedData = [...data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedData);
        setFilteredOrders(sortedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setOrders([]);
        setFilteredOrders([]);
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

  const looksLikeUUID = (s) => {
    if (!s) return false;
    const trimmed = s.trim();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(trimmed);
  };

  const searchByQR = async (query) => {
    const token = localStorage.getItem("token");
    const trimmed = query.trim();
    if (looksLikeUUID(trimmed)) {
      try {
        const resp = await fetch(
          `${API_ORDER_URL}/qr/${encodeURIComponent(trimmed)}`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
          }
        );
        if (resp.ok) {
          const order = await resp.json();
          setFilteredOrders(order ? [order] : []);
          return;
        }
      } catch {}
    }
    const lower = trimmed.toLowerCase();
    const results = orders.filter((order) => {
      if (!order) return false;
      if (
        order.qrCodeBase64 &&
        order.qrCodeBase64.toLowerCase().includes(lower)
      )
        return true;
      if (order.clientName && order.clientName.toLowerCase().includes(lower))
        return true;
      if (
        !Number.isNaN(Number(trimmed)) &&
        String(order.id) === String(trimmed)
      )
        return true;
      for (const key of Object.keys(order)) {
        const val = order[key];
        if (typeof val === "string" && val.toLowerCase().includes(lower))
          return true;
      }
      return false;
    });
    setFilteredOrders(results);
  };

  const handleSearch = async () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredOrders(orders);
      return;
    }
    if (searchType === "name") {
      setFilteredOrders(
        orders.filter((o) => {
          if (!o.clientName) return false;
          const parts = o.clientName.toLowerCase().split(" ");
          return parts.some((p) => p.includes(query));
        })
      );
      return;
    }
    if (searchType === "id") {
      setFilteredOrders(orders.filter((o) => String(o.id) === searchQuery));
      return;
    }
    if (searchType === "qr") {
      await searchByQR(searchQuery);
      return;
    }
  };

  const handleChangeState = async (newState) => {
    if (!selectedOrder) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ORDER_URL}/${selectedOrder.id}/state`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newState }),
        }
      );
      if (!response.ok) throw new Error("No se pudo actualizar el estado.");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, state: newState } : o
        )
      );
      setFilteredOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, state: newState } : o
        )
      );
      setSelectedOrder((prev) => ({ ...prev, state: newState }));
    } catch (err) {
      alert("Error al cambiar el estado: " + err.message);
    }
  };

  return (
    <div className="container text-white py-5">
      <h2 className="mb-4 fw-bold">Todas las Órdenes</h2>

      <div className="d-flex gap-2 mb-4">
        <Col md={3} className="mb-2 mb-md-0 text-center">
          <ButtonGroup>
            <ToggleButton
              id="search-name"
              type="radio"
              variant="outline-light"
              name="searchType"
              value="name"
              checked={searchType === "name"}
              onChange={() => setSearchType("name")}
            >
              Nombre / Apellido
            </ToggleButton>
            <ToggleButton
              id="search-id"
              type="radio"
              variant="outline-light"
              name="searchType"
              value="id"
              checked={searchType === "id"}
              onChange={() => setSearchType("id")}
            >
              ID
            </ToggleButton>
            <ToggleButton
              id="search-qr"
              type="radio"
              variant="outline-light"
              name="searchType"
              value="qr"
              checked={searchType === "qr"}
              onChange={() => setSearchType("qr")}
            >
              QR
            </ToggleButton>
          </ButtonGroup>
        </Col>
        <Form.Control
          type="text"
          placeholder={
            searchType === "qr"
              ? "Pega/escaneá el valor del QR..."
              : "Ingresá el valor a buscar..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="orders-input"
        />
        <Button className="orders-btn" onClick={handleSearch}>
          Buscar
        </Button>
        <Button
          variant="outline-light"
          onClick={() => {
            setSearchQuery("");
            setFilteredOrders(orders);
          }}
        >
          Limpiar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando todas las órdenes...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">Error: {error}</div>
      ) : filteredOrders.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <ListGroup>
          {filteredOrders.map((order) => (
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
                  <div className="orders-client-name small fw-bold">
                    {order.clientName}
                  </div>
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
            <Modal.Title>Orden #{selectedOrder.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Fecha:</strong> {formatDateTime(selectedOrder.date)}
            </p>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Estado:</strong>
              </Form.Label>
              <Form.Select
                value={selectedOrder.state}
                onChange={(e) => handleChangeState(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Sent">Sent</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
            <hr />
            <h5>Datos del Cliente</h5>
            <p>
              <strong>Nombre:</strong> {selectedOrder.clientName}
            </p>
            <p>
              <strong>ID Cliente:</strong> {selectedOrder.clientId}
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
                  alt={`QR Orden #${selectedOrder.id}`}
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

export default Orders;
