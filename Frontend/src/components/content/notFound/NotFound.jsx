import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  const goBackHandler = () => {
    navigate("/");
  };

  useEffect(() => {
    document.body.classList.add("notfound-background");
    return () => {
      document.body.classList.remove("notfound-background");
    };
  }, []);

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <h2 className="notfound-title">
          Parece que página solicitada no fue encontrada.
        </h2>
        <Button variant="danger" onClick={goBackHandler}>
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
