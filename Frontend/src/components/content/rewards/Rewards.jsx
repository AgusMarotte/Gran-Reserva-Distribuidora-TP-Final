import React, { useState, useEffect } from "react";
import ItemList from "../itemlist/ItemList";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import "./Rewards.css";

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("rewards-background");
    return () => {
      document.body.classList.remove("rewards-background");
    };
  }, []);

  useEffect(() => {
    fetch(
      "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/reward"
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

  const handleAddToCart = (rewards) => {
    if (rewards.stock <= 0) {
      toast.warn("Sin stock disponible");
      return;
    }

    setRewards((prevRewards) =>
      prevRewards.map((p) =>
        r.id === rewards.id ? { ...r, stock: r.stock - 1 } : p
      )
    );

    toast.success(`${rewards.name} agregado al carrito`);
  };

  if (loading) {
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
        onAction={handleAddToCart}
        actionText="Agregar al Carrito"
        emptyListMessage="No hay recompensas disponibles en este momento."
      />
    </div>
  );
};

export default Rewards;
