import { useState, useEffect, useCallback, useMemo } from "react";
import ItemList from "../itemlist/ItemList";
import ItemModal from "../itemmodal/ItemModal";
import { toast } from "react-toastify";
import {
  Spinner,
  Form,
  Row,
  Col,
  Dropdown,
  ButtonGroup,
  ToggleButton,
  Button,
} from "react-bootstrap";
import { ArrowDown, ArrowUp, PlusCircleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import "./Rewards.css";

const API_REWARD_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Reward";

const Rewards = ({ userPoints, onPointsUpdate }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "pointsRequired",
    direction: "asc",
  });

  const [viewMode, setViewMode] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [selectedReward, setSelectedReward] = useState(null);

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("rewards-background");
    return () => {
      document.body.classList.remove("rewards-background");
    };
  }, []);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [activeResp, allResp] = await Promise.all([
          fetch(`${API_REWARD_URL}?includesoftdeleted=false`),
          fetch(`${API_REWARD_URL}?includesoftdeleted=true`),
        ]);

        if (!activeResp.ok || !allResp.ok)
          throw new Error("Error al obtener recompensas");

        const activeData = await activeResp.json();
        const allData = await allResp.json();

        const activeIds = new Set(activeData.map((r) => r.id));
        let merged = allData.map((r) => ({
          ...r,
          isDeleted: !activeIds.has(r.id),
        }));

        if (searchTerm) {
          merged = merged.filter((r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setRewards(merged);
      } else {
        let url = API_REWARD_URL;
        if (searchTerm) {
          url = `${url}/search?name=${encodeURIComponent(searchTerm)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al cargar recompensas");
        const data = await res.json();
        setRewards(data.map((r) => ({ ...r, isDeleted: false })));
      }
    } catch (err) {
      console.error("Error fetching rewards:", err);
      toast.error("Error al cargar las recompensas.");
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, isAdmin]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedRewards = useMemo(() => {
    let list = [...rewards];
    if (isAdmin) {
      if (viewMode === "active") list = list.filter((r) => !r.isDeleted);
      else if (viewMode === "deleted") list = list.filter((r) => r.isDeleted);
    }

    if (sortConfig.key) {
      list.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [rewards, sortConfig, isAdmin, viewMode]);

  const openModal = (mode, reward) => {
    setModalMode(mode);
    setSelectedReward(reward);
    setShowModal(true);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleAction = (reward) => {
    if (isAdmin) {
      openModal("edit", reward);
    } else {
      redeemReward(reward);
    }
  };

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
        const text = await response.text();
        throw new Error(text || "Error al canjear recompensa.");
      }

      const data = await response.json();
      if (data.clientCurrentPoints !== undefined) {
        onPointsUpdate(data.clientCurrentPoints);
      }

      toast.success("Canje realizado con éxito");
      navigate("/my-exchanges");
    } catch (err) {
      toast.error(err.message || "Error al canjear.");
    } finally {
      setLoading(false);
    }
  };

  const SortIcon = ({ fieldKey }) => {
    if (sortConfig.key !== fieldKey) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ms-1" />
    ) : (
      <ArrowDown className="ms-1" />
    );
  };

  const noRewardsFound = !loading && sortedRewards.length === 0;

  return (
    <div className="container mt-4" style={{ color: "white" }}>
      <h3 className="mb-3 text-center">Recompensas Disponibles</h3>

      <Row className="mb-4 align-items-end g-2">
        <Col md={isAdmin ? 3 : 6}>
          <Form.Control
            type="text"
            placeholder="Buscar recompensa..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Col>

        {isAdmin && (
          <Col md={3} className="text-center">
            <ButtonGroup>
              <ToggleButton
                id="view-active-reward"
                type="radio"
                variant="outline-light"
                name="view-reward"
                value="active"
                checked={viewMode === "active"}
                onChange={() => setViewMode("active")}
              >
                Activas
              </ToggleButton>
              <ToggleButton
                id="view-all-reward"
                type="radio"
                variant="outline-light"
                name="view-reward"
                value="all"
                checked={viewMode === "all"}
                onChange={() => setViewMode("all")}
              >
                Todas
              </ToggleButton>
              <ToggleButton
                id="view-deleted-reward"
                type="radio"
                variant="outline-light"
                name="view-reward"
                value="deleted"
                checked={viewMode === "deleted"}
                onChange={() => setViewMode("deleted")}
              >
                Eliminadas
              </ToggleButton>
            </ButtonGroup>
          </Col>
        )}

        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" className="w-100">
              Ordenar por <SortIcon fieldKey={sortConfig.key} />
            </Dropdown.Toggle>
            <Dropdown.Menu data-bs-theme="dark">
              <Dropdown.Item onClick={() => handleSort("name")}>
                Nombre <SortIcon fieldKey="name" />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort("pointsRequired")}>
                Puntos <SortIcon fieldKey="pointsRequired" />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        {isAdmin && (
          <Col md={3} className="text-end">
            <Button
              variant="danger"
              className="w-100"
              onClick={handleOpenCreateModal}
              style={{ whiteSpace: "nowrap" }}
            >
              <PlusCircleFill className="me-1" /> Crear
            </Button>
          </Col>
        )}
      </Row>

      {loading ? (
        <div className="page-center">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando Recompensas...</p>
        </div>
      ) : noRewardsFound ? (
        <p className="text-center mt-5">No se encontraron recompensas.</p>
      ) : (
        <ItemList
          items={sortedRewards}
          onAction={handleAction}
          onEdit={(r) => openModal("edit", r)}
          onDelete={(r) => openModal("delete", r)}
          isAdmin={isAdmin}
          actionText="Canjear"
          emptyListMessage="No hay recompensas disponibles."
        />
      )}

      <ItemModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        product={selectedReward}
        mode={modalMode}
        onProductAction={fetchRewards}
      />

      <ItemModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        mode="create"
        itemType="reward"
        onProductAction={fetchRewards}
      />
    </div>
  );
};

export default Rewards;
