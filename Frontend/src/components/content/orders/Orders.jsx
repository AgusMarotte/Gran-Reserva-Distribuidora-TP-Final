import { useEffect, useState, useMemo, useCallback } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import AdminSearchControls from "../../ui/adminsearchcontrols/AdminSearchControls";
import OrderModal from "./OrderModal";
import "./Orders.css";

const API_ORDER_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Order";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState(null);
  const [qrSearchResult, setQrSearchResult] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ORDER_URL, {
        headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
      });
      if (!response.ok) throw new Error("Error al obtener las órdenes.");
      const data = await response.json();
      const sortedData = [...data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setOrders(sortedData);
    } catch (err) {
      setError(err.message);
      setOrders([]);
      toast.error(err.message || "Error al cargar órdenes.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [fetchOrders, token]);

  const looksLikeUUID = (s) => {
    if (!s) return false;
    const trimmed = s.trim();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(trimmed);
  };

  useEffect(() => {
    const fetchByQR = async (query) => {
      if (!token) return;
      setLoading(true);
      try {
        const resp = await fetch(
          `${API_ORDER_URL}/qr/${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
          }
        );
        if (resp.ok) {
          const order = await resp.json();
          setQrSearchResult(order ? [order] : []);
        } else {
          setQrSearchResult([]);
        }
      } catch (err) {
        toast.error("Error al buscar por QR");
        setQrSearchResult([]);
      } finally {
        setLoading(false);
      }
    };

    const query = searchQuery.trim();
    if (searchType === "qr" && looksLikeUUID(query)) {
      fetchByQR(query);
    } else {
      setQrSearchResult(null);
    }
  }, [searchQuery, searchType, token]);

  const filteredOrders = useMemo(() => {
    if (qrSearchResult !== null) {
      return qrSearchResult;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter((o) => {
      if (searchType === "name") {
        return o.clientName?.toLowerCase().includes(query);
      }
      if (searchType === "id") {
        return String(o.id).includes(query);
      }
      if (searchType === "qr") {
        return o.qrCode?.toLowerCase().includes(query);
      }
      return false;
    });
  }, [orders, searchQuery, searchType, qrSearchResult]);

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

  const handleChangeState = async (newState) => {
    if (!selectedOrder) return;
    try {
      const response = await fetch(
        `${API_ORDER_URL}/${selectedOrder.id}/state`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ NewState: newState }),
        }
      );
      if (!response.ok) throw new Error("No se pudo actualizar el estado.");

      const updatedOrder = { ...selectedOrder, state: newState };
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o))
      );
      setSelectedOrder(updatedOrder);
      toast.success(`Orden #${selectedOrder.id} actualizada a ${newState}.`);
    } catch (err) {
      toast.error("Error al cambiar el estado: " + err.message);
    }
  };

  const searchTypeConfig = {
    searchType,
    onSearchTypeChange: setSearchType,
    options: [
      { value: "name", label: "Nombre / Apellido" },
      { value: "id", label: "ID" },
      { value: "qr", label: "QR" },
    ],
  };

  const searchQueryConfig = {
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    placeholder: "Ingresá el valor a buscar...",
  };

  const clearButtonConfig = {
    label: "Limpiar",
    onClick: () => setSearchQuery(""),
  };

  return (
    <div className="container text-white py-5">
      <h2 className="mb-4 fw-bold">Todas las Órdenes</h2>

      <AdminSearchControls
        searchTypeConfig={searchTypeConfig}
        searchQueryConfig={searchQueryConfig}
        clearButtonConfig={clearButtonConfig}
      />

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

      <OrderModal
        show={showModal}
        onHide={handleCloseModal}
        order={selectedOrder}
        onStateChange={handleChangeState}
      />
    </div>
  );
};

export default Orders;
