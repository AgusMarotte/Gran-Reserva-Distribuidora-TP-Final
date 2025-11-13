import { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { PersonCircle, BoxArrowRight, Coin } from "react-bootstrap-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoSrc from "/icon-w.svg";
import CountUp from "../countup/CountUp.jsx";
import "./NavBar.css";

const NavBar = ({ token, isAdmin, onLogout, userPoints }) => {
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const aboutusActive = location.pathname === "/about-us";
  const productsActive = location.pathname === "/products";
  const rewardsActive = location.pathname === "/rewards";
  const myOrdersActive = location.pathname === "/myOrders";
  const loginActive = location.pathname === "/login";
  const myExchangesActive = location.pathname === "/myExchanges";

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
      <Container fluid className="navbar-container">
        <Navbar.Brand as={Link} to="/" className="brand navlink">
          Gran Reserva
          <img src={logoSrc} width="50" height="50" alt="Gran Reserva Logo" />
        </Navbar.Brand>
        <Nav>
          <Nav.Link
            as={Link}
            to="/about-us"
            className={aboutusActive ? "underlined navlink" : "navlink"}
          >
            Sobre Nosotros
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/products"
            className={productsActive ? "underlined navlink" : "navlink"}
          >
            Productos
          </Nav.Link>
          {token && (
            <Nav.Link as={Link} to="/rewards" className="navlink">
              <Coin className="mx-1" />
              <span className={rewardsActive ? "underlined" : ""}>
                <CountUp
                  from={0}
                  to={userPoints || 0}
                  separator=","
                  direction="up"
                  duration={1}
                  className="count-up-text"
                />
                {" Puntos"}
              </span>
            </Nav.Link>
          )}
          {token && (
            <Nav.Link
              as={Link}
              to="/myOrders"
              className={myOrdersActive ? "underlined navlink" : "navlink"}
            >
              Mis Órdenes
            </Nav.Link>
          )}
          {token && (
            <Nav.Link
              as={Link}
              to="/myExchanges"
              className={myExchangesActive ? "underlined navlink" : "navlink"}
            >
              Mis Canjes
            </Nav.Link>
          )}
          {token ? (
            <Nav.Link onClick={handleLogout} className="navlink">
              <BoxArrowRight />
              Cerrar Sesión
            </Nav.Link>
          ) : (
            <Nav.Link
              as={Link}
              to="/login"
              className={loginActive ? "underlined navlink" : "navlink"}
            >
              <PersonCircle />
              Iniciar Sesión
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;
