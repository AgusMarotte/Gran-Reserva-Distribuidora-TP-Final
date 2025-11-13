import { useState, useEffect } from "react";
import ItemList from "../itemlist/ItemList";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import "./Rewards.css";

const Rewards = ({ userPoints, onPointsUpdate }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.classList.add("rewards-background");
    return () => {
      document.body.classList.remove("rewards-background");
    };
  }, []);

  useEffect(() => {
    fetch(
      "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Reward"
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron cargar las recompensas");
        }
        return res.json();
      })
      .then((data) => {
        setRewards(data);
      })
      .catch((err) => {
        console.error("Error fetching rewards:", err);
        toast.error("Error al cargar las recompensas.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
        const errorData = await response.json();
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
    } catch (err) {
      toast.error(err.message || "Error al canjear.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && rewards.length === 0) {
    return (
      <div className="page-center">
        <Spinner animation="border" variant="light" />
        Cargando Listado de Recompensas
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ color: "white" }}>
      <h3 className="mb-3 text-center">Recompensas Disponibles</h3>

      <ItemList
        items={rewards}
        onAction={redeemReward}
        actionText="Canjear"
        emptyListMessage="No hay recompensas disponibles en este momento."
      />
    </div>
  );
};

export default Rewards;
