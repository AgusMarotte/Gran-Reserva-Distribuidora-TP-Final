import { useEffect, useState } from "react";
import { Navbar, Container, Nav, Badge, Dropdown } from "react-bootstrap";
import {
  PersonCircle,
  BoxArrowRight,
  Coin,
  Cart,
  Gear,
} from "react-bootstrap-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoSrc from "/icon-w.svg";
import CountUp from "../countup/CountUp.jsx";
import { useCart } from "../../content/cart/Cart.jsx";
import "./NavBar.css";

const NavBar = ({ token, isAdmin, onLogout, userPoints }) => {
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { totalItemsCount, setIsCartOpen } = useCart();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const aboutusActive = location.pathname === "/about-us";
  const productsActive = location.pathname === "/products";
  const rewardsActive = location.pathname === "/rewards";
  const myOrdersActive = location.pathname === "/my-orders";
  const loginActive = location.pathname === "/login";
  const myExchangesActive = location.pathname === "/my-exchanges";
  const settingsActive = location.pathname === "/settings";

  const adminUsersActive = location.pathname === "/admin/users";
  const adminOrdersActive = location.pathname === "/admin/orders";
  const adminExchangesActive = location.pathname === "/admin/exchanges";

  const calculateWidthInCh = (digits) => {
    if (!digits || digits < 1) digits = 1;
    const commas = Math.floor((digits - 1) / 3);
    return digits + commas + "ch";
  };

  const maxPointsDigits = 6;

  const countUpStyle = {
    minWidth: calculateWidthInCh(maxPointsDigits),
    display: "inline-block",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const UserDropdown = () => (
    <Dropdown className="d-flex align-items-center">
      <Dropdown.Toggle
        variant="secondary"
        id="user-dropdown-toggle"
        className="navlink"
        style={{ backgroundColor: "transparent", border: "none" }}
      >
        <PersonCircle className="me-1" />
        Mi Cuenta
      </Dropdown.Toggle>

      <Dropdown.Menu data-bs-theme="dark" style={{ zIndex: 1050 }}>
        {token && !isAdmin && (
          <>
            <Dropdown.Item
              as={Link}
              to="/my-orders"
              active={myOrdersActive}
              className="dropdown-link"
            >
              Mis Pedidos
            </Dropdown.Item>
            <Dropdown.Item
              as={Link}
              to="/my-exchanges"
              active={myExchangesActive}
              className="dropdown-link"
            >
              Mis Canjes
            </Dropdown.Item>
            <Dropdown.Divider />
          </>
        )}

        <Dropdown.Item
          as={Link}
          to="/settings"
          active={settingsActive}
          className="dropdown-link"
        >
          <Gear className="me-1" />
          Configuración
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item onClick={handleLogout} className="dropdown-link">
          <BoxArrowRight className="me-1" />
          Cerrar Sesión
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

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
          {token && isAdmin ? (
            <>
              <Nav.Link
                as={Link}
                to="/products"
                className={productsActive ? "underlined navlink" : "navlink"}
              >
                Productos
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/rewards"
                className={rewardsActive ? "underlined navlink" : "navlink"}
              >
                Recompensas
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/users"
                className={adminUsersActive ? "underlined navlink" : "navlink"}
              >
                Usuarios
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/orders"
                className={adminOrdersActive ? "underlined navlink" : "navlink"}
              >
                Órdenes
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/exchanges"
                className={
                  adminExchangesActive ? "underlined navlink" : "navlink"
                }
              >
                Canjes
              </Nav.Link>
            </>
          ) : (
            <>
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

              {token && !isAdmin && (
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
                      minIntegerDigits={maxPointsDigits}
                      style={countUpStyle}
                    />
                    {" Recompensas"}
                  </span>
                </Nav.Link>
              )}
            </>
          )}

          {token && !isAdmin && (
            <Nav.Link onClick={() => setIsCartOpen(true)} className="navlink">
              <Cart />
              {totalItemsCount > 0 && (
                <Badge pill bg="danger" className="ms-1">
                  {totalItemsCount}
                </Badge>
              )}
              <span className="ms-1">Carrito</span>
            </Nav.Link>
          )}

          {token ? (
            <UserDropdown />
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
