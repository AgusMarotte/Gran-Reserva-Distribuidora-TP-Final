import { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import logoSrc from "/icon-w.svg";
import "./NavBar.css";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
    >
      <Container fluid className="d-flex justify-content-center">
        <Navbar.Brand as={Link} to="/" className="brand text">
          Gran Reserva
          <img src={logoSrc} width="50" height="50" alt="Gran Reserva Logo" />
        </Navbar.Brand>
        <Nav>
          <Nav.Link className="text" to="/">
            Sucursales
          </Nav.Link>
          <Nav.Link className="text" href="#about-us">
            Sobre Nosotros
          </Nav.Link>
          <Nav.Link as={Link} to="/login" className="text">
            Iniciar Sesión
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
