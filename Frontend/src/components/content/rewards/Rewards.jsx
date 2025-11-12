import { useState, useEffect } from "react";

const API_BASE = "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api";

export default function RewardsUser() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userPoints = localStorage.getItem("points");

  useEffect(() => {
    fetch(`${API_BASE}/Reward`)
      .then(res => res.json())
      .then(data => {
        const repeated = Array(6).fill(data).flat();
        setRewards(repeated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const redeemReward = async (rewardId, pointsRequired) => {
    if (!token) {
      alert("Necesitas iniciar sesión para canjear.");
      return;
    }

    if (Number(userPoints) < pointsRequired) {
      alert("No tienes puntos suficientes.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/RewardExchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rewardId })
      });

      if (!response.ok) {
        alert("No se pudo realizar el canje.");
        return;
      }

      alert("Canje realizado con éxito");
      window.location.reload();

    } catch (error) {
      alert("Error al canjear.");
    }
  };

  if (loading) return <p style={{ color: "white" }}>Cargando recompensas...</p>;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Recompensas Disponibles</h1>
      <h3>Puntos disponibles: <span style={{ color: "#ffd700" }}>💰 {userPoints ?? 0}</span></h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>

        {rewards.map((reward, index) => (
          <div key={index} style={{
            background: "#111",
            borderRadius: "10px",
            padding: "15px",
            textAlign: "center",
            border: "1px solid #333"
          }}>
            <img
              src={reward.imageUrl}
              alt={reward.name}
              style={{ width: "100%", height: "180px", objectFit: "contain" }}
            />

            <h2>{reward.name}</h2>
            <p style={{ opacity: 0.8 }}>{reward.description}</p>

            <p><b>Puntos:</b> <span style={{ color: "#ffd700" }}>💰 {reward.pointsRequired}</span></p>
            <p><b>Stock:</b> {reward.stock}</p>

            <button
              onClick={() => redeemReward(reward.id, reward.pointsRequired)}
              style={{
                width: "100%",
                padding: "10px",
                background: "red",
                border: "none",
                borderRadius: "5px",
                marginTop: "10px",
                cursor: "pointer"
              }}
            >
              Canjear
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
