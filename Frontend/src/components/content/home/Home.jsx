import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import "./Home.css";
import card1 from "../../../assets/images/card1.png";
import card2 from "../../../assets/images/card2.png";
import card3 from "../../../assets/images/card3.png";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Container className="home-container my-5">
      <div>
        <Row className="align-items-center">
          <Col md={6} className="position-relative mb-4 mb-md-0">
            <img
              src={card1}
              alt="Imagen descriptiva"
              className="home-image-left vignette-gradient"
            />
            <div className="vignette-overlay"></div>
          </Col>
          <Col md={6} className="text-white text-center text-md-start">
            <h2 className="home-title">
              {" "}
              Bienvenido a Gran Reserva Distribuidora
            </h2>
            <p className="home-description">
              Tu socio confiable en la distribución de bebidas de calidad.
              Explora nuestra amplia gama de productos y descubre por qué somos
              la elección preferida para los amantes de las bebidas.
            </p>
          </Col>
        </Row>
      </div>

      <div>
        <Row className="align-items-center">
          <Col md={6} className="text-white text-center text-md-end">
            <h2 className="home-title">
              {" "}
              Contamos con una gran selección de vinos{" "}
            </h2>
            <p className="home-description">
              Desde tintos robustos hasta blancos frescos, nuestra colección de
              vinos satisface todos los paladares y ocasiones. Ya sea que estés
              buscando un vino para una cena especial o simplemente para
              disfrutar
            </p>
          </Col>
          <Col md={6} className="position-relative mb-4 mb-md-0">
            <img
              src={card2}
              alt="Imagen descriptiva"
              className="home-image vignette-gradient"
            />
            <div className="vignette-overlay"></div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Home;
