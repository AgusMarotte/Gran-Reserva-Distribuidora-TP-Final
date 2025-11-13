import { useState, useEffect, useCallback, useMemo } from "react";
import ItemList from "../itemlist/ItemList";
import { toast } from "react-toastify";
import { Spinner, Form, Row, Col, Dropdown } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import "./Rewards.css";

const Rewards = ({ userPoints, onPointsUpdate }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "pointsRequired",
    direction: "asc",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("rewards-background");
    return () => {
      document.body.classList.remove("rewards-background");
    };
  }, []);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    let url =
      "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Reward";

    if (searchTerm) {
      url = `${url}/search?name=${encodeURIComponent(searchTerm)}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("No se pudieron cargar las recompensas");
      }
      const data = await res.json();
      setRewards(data);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      toast.error("Error al cargar las recompensas.");
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ fieldKey }) => {
    if (sortConfig.key !== fieldKey) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ms-1" />
    ) : (
      <ArrowDown className="ms-1" />
    );
  };

  const sortedRewards = useMemo(() => {
    let sortableItems = [...rewards];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "pointsRequired":
            aValue = a.pointsRequired;
            bValue = b.pointsRequired;
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rewards, sortConfig]);

  const redeemReward = async (reward) => {
    if (!token) {
      toast.error("Necesitas iniciar sesión para canjear.");
      return;
    }

    if (Number(userPoints) < reward.pointsRequired) {
      toast.warn("No tienes puntos suficientes.");
      return;
    }

    if (reward.stock <= 0) {
      toast.warn("Sin stock disponible");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/RewardExchange",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rewardId: reward.id }),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(responseText || "No se pudo realizar el canje.");
        }
        throw new Error(errorData.error || "No se pudo realizar el canje.");
      }

      const exchangeData = await response.json();

      if (exchangeData.clientCurrentPoints !== undefined) {
        onPointsUpdate(exchangeData.clientCurrentPoints);
      }

      setRewards((prevRewards) =>
        prevRewards.map((r) =>
          r.id === reward.id ? { ...r, stock: r.stock - 1 } : r
        )
      );

      toast.success("Canje realizado con éxito");

      navigate("/my-exchanges");
    } catch (err) {
      toast.error(err.message || "Error al canjear.");
    } finally {
      setLoading(false);
    }
  };

  const noRewardsFound = !loading && sortedRewards.length === 0;

  return (
    <div className="container mt-4" style={{ color: "white" }}>
      <h3 className="mb-3 text-center">Recompensas Disponibles</h3>

      <Row className="mb-4 justify-content-center">
        <Col md={4} className="mb-3 mb-md-0">
          <Form.Control
            type="text"
            placeholder="Buscar recompensa..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Col>

        <Col md={2}>
          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-sort"
              className="w-100"
            >
              Ordenar por
              <SortIcon fieldKey={sortConfig.key} />
            </Dropdown.Toggle>

            <Dropdown.Menu
              data-bs-theme="dark"
              className="wine-sort-menu"
              style={{ minWidth: "100%", zIndex: 1050 }}
            >
              <Dropdown.Item
                onClick={() => handleSort("name")}
                className="filter-item"
              >
                Nombre <SortIcon fieldKey="name" />
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleSort("pointsRequired")}
                className="filter-item"
              >
                Puntos <SortIcon fieldKey="pointsRequired" />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {loading ? (
        <div className="page-center">
          <Spinner animation="border" variant="light" />
          Cargando Listado de Recompensas
        </div>
      ) : noRewardsFound ? (
        <p className="text-center mt-5">
          No se encontraron recompensas que coincidan con el nombre.
        </p>
      ) : (
        <ItemList
          items={sortedRewards}
          onAction={redeemReward}
          actionText="Canjear"
          emptyListMessage="No hay recompensas disponibles en este momento."
        />
      )}
    </div>
  );
};

export default Rewards;
