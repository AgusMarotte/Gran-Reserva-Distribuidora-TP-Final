import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Home.css";
import image1 from "../../../assets/images/wineglass.png";
import image2 from "../../../assets/images/bottlerack.png";
import image3 from "../../../assets/images/cellar.png";

const Home = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".home-section");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    let visibleSections = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;

          if (entry.intersectionRatio > 0.45) {
            visibleSections.add(el);
            el.classList.add("is-visible");
          } else if (entry.intersectionRatio < 0.25) {
            visibleSections.delete(el);
            el.classList.remove("is-visible");
          }
        });
      },
      { threshold: [0, 0.25, 0.45, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scroll-container">
      <section className="home-section">
        <img src={image1} alt="Imagen 1" className="home-image" />
        <Container className="home-text text-center text-white">
          <Row className="justify-content-center align-items-center">
            <Col md={10} lg={8}>
              <h2 className="home-title">
                Bienvenido a Gran Reserva Distribuidora
              </h2>
              <p className="home-description">
                Tu socio confiable en la distribución de bebidas de calidad.
                Explorá nuestra amplia gama de productos y descubrí por qué
                somos la elección preferida para los amantes de las bebidas.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home-section">
        <img src={image2} alt="Imagen 2" className="home-image" />
        <Container className="home-text text-center text-white">
          <Row className="justify-content-center align-items-center">
            <Col md={10} lg={8}>
              <h2 className="home-title">
                Contamos con una gran selección de vinos
              </h2>
              <p className="home-description">
                Desde tintos robustos hasta blancos frescos, nuestra colección
                de vinos satisface todos los paladares y ocasiones.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home-section">
        <img src={image3} alt="Imagen 3" className="home-image" />
        <Container className="home-text text-center text-white">
          <Row className="justify-content-center align-items-center">
            <Col md={10} lg={8}>
              <h2 className="home-title">
                La esencia del vino, guardada con pasión
              </h2>
              <p className="home-description">
                En nuestras bodegas, cada botella reposa en condiciones ideales,
                preservando su sabor y carácter únicos.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
