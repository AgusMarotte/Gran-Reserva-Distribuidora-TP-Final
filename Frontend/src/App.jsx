import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import NavBar from "./components/ui/navbar/NavBar.jsx";
import Footer from "./components/ui/footer/Footer.jsx";
import Home from "./components/content/home/Home.jsx";
import Terms from "./components/content/legal/terms/Terms.jsx";
import Privacy from "./components/content/legal/privacy/Privacy.jsx";
import Products from "./components/content/products/Products.jsx";
import Login from "./components/auth/login/Login.jsx";
import Register from "./components/auth/register/Register.jsx";
import Rewards from "./components/content/rewards/Rewards.jsx";
import MyOrders from "./components/content/myOreders/MyOrders.jsx";
import NotFound from "./components/content/notfound/NotFound.jsx";
import Protected from "./components/auth/protected/Protected.jsx";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (token, isAdminFlag) => {
    setToken(token);
    setIsAdmin(isAdminFlag);
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", isAdminFlag);
  };

  const handleLogout = () => {
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  };

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        const savedIsAdmin = localStorage.getItem("isAdmin") === "true";
        setIsAdmin(savedIsAdmin);
      }
    } catch (error) {
      console.error("Error al recuperar datos de localStorage", error);
    } finally {
      setIsLoading(false);
    }
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
      <NavBar
        token={token}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onLogin={handleLogin}
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
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/myOrders"
            element={
              <Protected isSignedIn={token} isLoading={isLoading}>
                <MyOrders />
              </Protected>
            }
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
