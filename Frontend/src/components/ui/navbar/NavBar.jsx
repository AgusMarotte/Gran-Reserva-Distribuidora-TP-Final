import { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
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
        <Navbar.Brand as={Link} to="/" className="brand navlink">
          Gran Reserva
          <img src={logoSrc} width="50" height="50" alt="Gran Reserva Logo" />
        </Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to="/about-us" className="navlink">
            Sobre Nosotros
          </Nav.Link>
          <Nav.Link as={Link} to="/products" className="navlink">
            Productos
          </Nav.Link>
          <Nav.Link as={Link} to="/login" className="navlink">
            <PersonCircle />
            Iniciar Sesión
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
