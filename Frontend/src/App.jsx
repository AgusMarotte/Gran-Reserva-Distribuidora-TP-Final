import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer, Slide, toast } from "react-toastify";
import NavBar from "./components/ui/navbar/NavBar.jsx";
import Footer from "./components/ui/footer/Footer.jsx";
import Home from "./components/content/home/Home.jsx";
import Terms from "./components/content/legal/terms/Terms.jsx";
import Privacy from "./components/content/legal/privacy/Privacy.jsx";
import Products from "./components/content/products/Products.jsx";
import Login from "./components/auth/login/Login.jsx";
import Register from "./components/auth/register/Register.jsx";
import Rewards from "./components/content/rewards/Rewards.jsx";
import MyOrders from "./components/content/myorders/MyOrders.jsx";
import NotFound from "./components/content/notfound/NotFound.jsx";
import Protected from "./components/auth/protected/Protected.jsx";
import Public from "./components/auth/public/Public.jsx";
import MyRewardExchanges from "./components/content/myrewardexchanges/MyRewardExchanges.jsx";
import Cart from "./components/content/cart/Cart.jsx";
import Settings from "./components/content/settings/Settings.jsx";
import Orders from "./components/content/orders/Orders.jsx";
import Users from "./components/content/users/Users.jsx";
import Exchanges from "./components/content/exchanges/Exchanges.jsx";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  const handlePointsUpdate = (newPoints) => {
    const pointsNumber = Number(newPoints) || 0;
    setUserPoints(pointsNumber);
    localStorage.setItem("points", pointsNumber.toString());
  };

  const handleLogin = (newToken, newIsAdmin) => {
    setToken(newToken);
    setIsAdmin(newIsAdmin);
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", newIsAdmin);
    if (!newIsAdmin) {
      fetch(
        "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          handlePointsUpdate(data.points);
        })
        .catch((error) => console.error("Error fetching user points:", error));
    }
  };

  const handleLogout = () => {
    setToken(null);
    setIsAdmin(false);
    setUserPoints(0);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("points");
    localStorage.removeItem("shoppingCart");
    toast.info("Sesión cerrada correctamente.");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
      const storedPoints = localStorage.getItem("points");

      setToken(storedToken);
      setIsAdmin(storedIsAdmin);
      setUserPoints(Number(storedPoints) || 0);

      if (storedToken && !storedIsAdmin) {
        try {
          const response = await fetch(
            "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/user/profile",
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            handlePointsUpdate(data.points);
          } else {
            console.error("Failed to fetch user points");
          }
        } catch (error) {
          console.error("Error fetching user points:", error);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    fetch(
      "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Jokes/random"
    )
      .then((res) => console.log("Backend 'calentado', estado:", res.status))
      .catch((err) => console.error("Error al 'calentar' el backend:", err));
  }, []);

  return (
    <Router basename="/Gran-Reserva-Distribuidora-TP-Final/">
      <Cart onPointsUpdate={handlePointsUpdate}>
        <NavBar
          token={token}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          userPoints={userPoints}
        />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          closeOnClick
          theme="colored"
          pauseOnHover
          transition={Slide}
          limit={3}
        />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <Public isSignedIn={token} isLoading={isLoading}>
                  <Login onLogin={handleLogin} />
                </Public>
              }
            />
            <Route
              path="/register"
              element={
                <Public isSignedIn={token} isLoading={isLoading}>
                  <Register />
                </Public>
              }
            />
            <Route
              path="/rewards"
              element={
                <Rewards
                  userPoints={userPoints}
                  onPointsUpdate={handlePointsUpdate}
                />
              }
            />
            <Route
              path="/my-exchanges"
              element={
                <Protected isSignedIn={token} isLoading={isLoading}>
                  <MyRewardExchanges />
                </Protected>
              }
            />
            <Route path="/products" element={<Products />} />
            <Route
              path="/my-orders"
              element={
                <Protected isSignedIn={token} isLoading={isLoading}>
                  <MyOrders />
                </Protected>
              }
            />
            <Route
              path="/settings"
              element={
                <Protected isSignedIn={token} isLoading={isLoading}>
                  <Settings onLogin={handleLogin} />
                </Protected>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <Protected isSignedIn={token} isLoading={isLoading}>
                  <Orders />
                </Protected>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Protected isSignedIn={token} isLoading={isLoading}>
                  <Users />
                </Protected>
              }
            />
            <Route
              path="/admin/exchanges"
              element={
                <Protected isSignedIn={token} isLoading={isLoading}>
                  <Exchanges />
                </Protected>
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </Cart>
    </Router>
  );
}

export default App;
