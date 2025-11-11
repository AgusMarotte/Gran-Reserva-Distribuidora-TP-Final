import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import NavBar from "./components/ui/navbar/NavBar.jsx";
import Footer from "./components/ui/footer/Footer.jsx";
import Home from "./components/content/home/Home.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Terms from "./components/content/legal/terms/Terms.jsx";
import Privacy from "./components/content/legal/privacy/Privacy.jsx";
import Products from "./components/content/products/Products.jsx";


function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <NavBar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}
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