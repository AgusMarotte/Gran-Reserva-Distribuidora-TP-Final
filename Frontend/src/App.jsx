import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import NavBar from "./components/ui/navbar/NavBar.jsx";
import Footer from "./components/ui/footer/Footer.jsx";
import Home from "./components/content/home/Home.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <NavBar />
      <div className="content">
        <Home />
      </div>
      <Footer />
    </>
  );
}

export default App;
