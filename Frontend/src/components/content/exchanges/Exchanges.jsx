import { useEffect, useState, useMemo, useCallback } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import AdminSearchControls from "../../ui/adminsearchcontrols/AdminSearchControls";
import ExchangeModal from "./ExchangeModal";
import "./Exchanges.css";

const API_EXCHANGE_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/RewardExchange";

const Exchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState(null);
  const [qrSearchResult, setQrSearchResult] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchExchanges = useCallback(async () => {
    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_EXCHANGE_URL, {
        headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
      });
      if (!response.ok) throw new Error("Error al obtener los canjes.");
      const data = await response.json();
      const sortedData = [...data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setExchanges(sortedData);
    } catch (err) {
      setError(err.message);
      setExchanges([]);
      toast.error(err.message || "Error al cargar canjes.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchExchanges();
    }
  }, [fetchExchanges, token]);

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
          `${API_EXCHANGE_URL}/qr/${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
          }
        );
        if (resp.ok) {
          const exchange = await resp.json();
          setQrSearchResult(exchange ? [exchange] : []);
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

  const filteredExchanges = useMemo(() => {
    if (qrSearchResult !== null) {
      return qrSearchResult;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return exchanges;
    }

    return exchanges.filter((e) => {
      if (searchType === "name") {
        return e.clientName?.toLowerCase().includes(query);
      }
      if (searchType === "id") {
        return String(e.id).includes(query);
      }
      if (searchType === "qr") {
        return e.qrCode?.toLowerCase().includes(query);
      }
      return false;
    });
  }, [exchanges, searchQuery, searchType, qrSearchResult]);

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
      <h2 className="mb-4 fw-bold">Canjes de Recompensas</h2>

      <AdminSearchControls
        searchTypeConfig={searchTypeConfig}
        searchQueryConfig={searchQueryConfig}
        clearButtonConfig={clearButtonConfig}
      />

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
                  <div className="exchanges-client-name small fw-bold">
                    {ex.clientName}
                  </div>
                </div>
                <h5 className="mb-0">{ex.pointsUsed} Puntos</h5>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <ExchangeModal
        show={showModal}
        onHide={handleCloseModal}
        exchange={selectedExchange}
      />
    </div>
  );
};

export default Exchanges;
