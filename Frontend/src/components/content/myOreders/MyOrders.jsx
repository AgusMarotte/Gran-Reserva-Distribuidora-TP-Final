import React, { useEffect, useState } from "react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("No se encontró el token de autenticación.");
          return;
        }

        const response = await fetch(
          "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Order/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Error 401: No autorizado. Iniciá sesión nuevamente.");
          } else {
            throw new Error("Ocurrió un error al obtener tus órdenes.");
          }
        }

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="text-white min-h-screen p-10">
      <h2 className="text-3xl font-bold mb-6">Mis Órdenes</h2>

      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : orders.length === 0 ? (
        <p>No tenés órdenes aún.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              
              const formattedDate = order.date
                ? new Date(order.date.split(".")[0]).toLocaleDateString("es-AR")
                : "Sin fecha";

              return (
                <tr key={order.id} className="border-b border-gray-700">
                  <td className="p-3">{order.id}</td>
                  <td className="p-3">{formattedDate}</td>
                  <td className="p-3">
                    $
                    {order.total.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3">{order.state}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;
