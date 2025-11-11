import { Link } from "react-router";
import { Github, EnvelopeAtFill } from "react-bootstrap-icons";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-waves">
        <svg
          className="footer-waves-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
            />
          </defs>
          <g className="wave-group">
            <use
              href="#gentle-wave"
              x="125"
              y="0"
              fill="rgba(44, 15, 16, 1)"
              className="wave-1"
            />
            <use
              href="#gentle-wave"
              x="5"
              y="3"
              fill="rgba(55,21,22, 1)"
              className="wave-2"
            />
            <use
              href="#gentle-wave"
              x="97"
              y="5"
              fill="rgba(81, 31, 33,1)"
              className="wave-3"
            />
            <use
              href="#gentle-wave"
              x="48"
              y="7"
              fill="rgba(132, 52, 54,1)"
              className="wave-4"
            />
          </g>
        </svg>
      </div>
      <div className="footer-content">
        <p>
          &copy; {currentYear} Gran Reserva Distribuidora. Todos los derechos
          reservados.
        </p>
        <nav className="footer-nav">
          <Link
            to="https://github.com/AgusMarotte/Gran-Reserva-Distribuidora-TP-Final"
            className="footer-link"
          >
            <Github />
            Github
          </Link>
          <Link to="/privacy" className="footer-link">
            Política de Privacidad
          </Link>
          <Link to="/terms" className="footer-link">
            Términos y Condiciones
          </Link>
          <Link to="/contact" className="footer-link">
            <EnvelopeAtFill />
            Contactanos
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
