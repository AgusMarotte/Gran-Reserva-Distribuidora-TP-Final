import { useEffect, useState, useMemo } from "react";
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
import "./Exchanges.css";

const API_EXCHANGE_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/RewardExchange";

const Exchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [filteredExchanges, setFilteredExchanges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró el token de autenticación.");
          setLoading(false);
          return;
        }
        const response = await fetch(API_EXCHANGE_URL, {
          headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
        });
        if (!response.ok) throw new Error("Error al obtener los canjes.");
        const data = await response.json();
        const sortedData = [...data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setExchanges(sortedData);
        setFilteredExchanges(sortedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setExchanges([]);
        setFilteredExchanges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  const looksLikeUUID = (s) => {
    if (!s) return false;
    const trimmed = s.trim();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(trimmed);
  };

  useEffect(() => {
    const searchByQR = async (query) => {
      const token = localStorage.getItem("token");
      const trimmed = query.trim();
      if (looksLikeUUID(trimmed)) {
        try {
          const resp = await fetch(
            `${API_EXCHANGE_URL}/qr/${encodeURIComponent(trimmed)}`,
            {
              headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
            }
          );
          if (resp.ok) {
            const exchange = await resp.json();
            setFilteredExchanges(exchange ? [exchange] : []);
            return;
          }
        } catch {}
      }
      const lower = trimmed.toLowerCase();
      const results = exchanges.filter((ex) => {
        if (!ex) return false;
        if (ex.qrCodeBase64 && ex.qrCodeBase64.toLowerCase().includes(lower))
          return true;
        if (ex.clientName && ex.clientName.toLowerCase().includes(lower))
          return true;
        if (!Number.isNaN(Number(trimmed)) && String(ex.id) === String(trimmed))
          return true;
        for (const key of Object.keys(ex)) {
          const val = ex[key];
          if (typeof val === "string" && val.toLowerCase().includes(lower))
            return true;
        }
        return false;
      });
      setFilteredExchanges(results);
    };

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredExchanges(exchanges);
      return;
    }
    if (searchType === "name") {
      setFilteredExchanges(
        exchanges.filter((ex) => {
          if (!ex.clientName) return false;
          const parts = ex.clientName.toLowerCase().split(" ");
          return parts.some((p) => p.includes(query));
        })
      );
      return;
    }
    if (searchType === "id") {
      setFilteredExchanges(
        exchanges.filter((ex) => String(ex.id).includes(query))
      );
      return;
    }
    if (searchType === "qr") {
      searchByQR(searchQuery);
      return;
    }
  }, [searchQuery, searchType, exchanges]);

  const handleShowModal = (exchange) => {
    setSelectedExchange(exchange);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedExchange(null);
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
      <h2 className="mb-4 fw-bold">Canjes de Recompensas</h2>

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
        <Button
          variant="outline-light"
          onClick={() => {
            setSearchQuery("");
          }}
        >
          Limpiar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando canjes...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">Error: {error}</div>
      ) : filteredExchanges.length === 0 ? (
        <p>No hay canjes registrados.</p>
      ) : (
        <ListGroup>
          {filteredExchanges.map((ex) => (
            <ListGroup.Item
              key={ex.id}
              action
              onClick={() => handleShowModal(ex)}
              className="bg-dark text-white border-secondary mb-2 rounded"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Canje ID#{ex.id}</h5>
                  <small className="text-secondary">
                    {formatDateTime(ex.date)}
                  </small>
                  <div className="orders-client-name small fw-bold">
                    {ex.clientName}
                  </div>
                </div>
                <h5 className="mb-0">{ex.pointsUsed} Puntos</h5>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {selectedExchange && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          data-bs-theme="dark"
        >
          <Modal.Header closeButton>
            <Modal.Title>Canje ID#{selectedExchange.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Fecha:</strong> {formatDateTime(selectedExchange.date)}
            </p>
            <hr />
            <h5>Datos del Cliente</h5>
            <p>
              <strong>Nombre:</strong> {selectedExchange.clientName}
            </p>
            <hr />
            <h5>Recompensa</h5>
            <ListGroup variant="flush">
              <ListGroup.Item className="bg-transparent text-white px-0">
                {selectedExchange.rewardName}
                <div className="d-flex justify-content-between text-secondary">
                  <span>Puntos usados:</span>
                  <strong>{selectedExchange.pointsUsed} Puntos</strong>
                </div>
              </ListGroup.Item>
            </ListGroup>
            {selectedExchange.qrCodeBase64 && (
              <div className="text-center my-3">
                <h6>Código QR:</h6>
                <img
                  src={`data:image/png;base64,${selectedExchange.qrCodeBase64}`}
                  alt={`QR Canje #${selectedExchange.id}`}
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
                Total: {selectedExchange.pointsUsed} Puntos
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

export default Exchanges;
