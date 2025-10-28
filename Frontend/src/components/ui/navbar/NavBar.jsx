import { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
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
        <Navbar.Brand className="brand text" href="#home">
          Gran Reserva
          <img
            src="/icon-w.svg"
            width="50"
            height="50"
            alt="Gran Reserva Logo"
          />
        </Navbar.Brand>
        <Nav>
          <Nav.Link
            className={`text ${scrolled ? "text-scrolled" : ""}`}
            href="#branches"
          >
            Sucursales
          </Nav.Link>
          <Nav.Link
            className={`text ${scrolled ? "text-scrolled" : ""}`}
            href="#about-us"
          >
            Sobre Nosotros
          </Nav.Link>
          <Nav.Link
            className={`text ${scrolled ? "text-scrolled" : ""}`}
            href="#login"
          >
            Iniciar Sesión
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
