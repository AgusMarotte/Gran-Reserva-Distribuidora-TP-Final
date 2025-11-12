import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/ui/navbar/NavBar.jsx";
import Footer from "./components/ui/footer/Footer.jsx";
import Home from "./components/content/home/Home.jsx";
import Terms from "./components/content/legal/terms/Terms.jsx";
import Privacy from "./components/content/legal/privacy/Privacy.jsx";
import Products from "./components/content/products/Products.jsx";
import Login from "./components/auth/login/Login.jsx";
import Register from "./components/auth/register/Register.jsx";
import Rewards from "./components/content/rewards/Rewards.jsx";
import { ToastContainer, Slide } from "react-toastify";
import "./App.css";

function App() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }

  return (
    <Router basename="/Gran-Reserva-Distribuidora-TP-Final/">
      <NavBar />
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/products" element={<Products />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
