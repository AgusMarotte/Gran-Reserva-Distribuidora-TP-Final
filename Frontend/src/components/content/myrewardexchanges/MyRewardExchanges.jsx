import { useEffect, useState } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import MyExchangeModal from "./MyExchangeModal";

const MyRewardExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No se encontró el token de autenticación.");
          return;
        }

        const response = await fetch(
          "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/RewardExchange/my-exchanges",
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
            throw new Error("Ocurrió un error al obtener tus canjes.");
          }
        }

        const data = await response.json();
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        setExchanges(sortedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching exchanges:", err.message);
        setError(err.message);
        toast.error(`Error al cargar canjes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExchanges();
  }, []);

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
      <h2 className="mb-4 fw-bold">Mis Canjes de Recompensas</h2>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando tus canjes...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">Error: {error}</div>
      )}

      {!loading && !error && exchanges.length === 0 && (
        <p>No tenés canjes de recompensas aún.</p>
      )}

      {!loading && !error && exchanges.length > 0 && (
        <ListGroup>
          {exchanges.map((exchange) => (
            <ListGroup.Item
              key={exchange.id}
              action
              onClick={() => handleShowModal(exchange)}
              className="bg-dark text-white border-secondary mb-2 rounded"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Canje ID#{exchange.id}</h5>
                  <small className="text-secondary">
                    {exchange.rewardName}
                  </small>
                </div>
                <h5 className="mb-0">-{exchange.pointsUsed} Puntos</h5>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <MyExchangeModal
        show={showModal}
        onHide={handleCloseModal}
        exchange={selectedExchange}
      />
    </div>
  );
};

export default MyRewardExchanges;
