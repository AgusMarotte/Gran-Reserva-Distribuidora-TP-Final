import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-background");
    return () => {
      document.body.classList.remove("login-background");
    };
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emptyForm = [];
    if (!formData.email) emptyForm.push("E-mail");
    if (!formData.password) emptyForm.push("Contraseña");

    if (emptyForm.length > 0) {
      const mensaje =
        emptyForm.length === 1
          ? `El campo "${emptyForm[0]}" no puede estar vacío.`
          : `Los campos "${emptyForm.join('" y "')}" no pueden estar vacíos.`;

      toast.error(mensaje);
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("El Email debe tener un formato válido.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Authentication",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const token = await response.text();

      if (!response.ok) {
        let errorMsg = "Error al iniciar sesión. Verifica tus credenciales.";
        try {
          const errorData = JSON.parse(token);
          errorMsg =
            errorData.error ||
            errorData.message ||
            "Error al iniciar sesión. Verifica tus credenciales.";
        } catch (jsonError) {
          if (token && token.length < 100) errorMsg = token;
        }
        toast.error(errorMsg);
      } else {
        toast.success("Login exitoso");
        const payload = parseJwt(token);
        const userRole = payload ? payload.role : "User";
        const isAdmin = userRole === "Admin" || userRole === "SuperAdmin";

        let points = 0;
        if (userRole === "User") {
          try {
            const pointsResponse = await fetch(
              "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/points",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (pointsResponse.ok) {
              const pointsData = await pointsResponse.json();
              points = pointsData.points;
            }
          } catch (pointsError) {
            console.error("Error fetching user points:", pointsError);
          }
        }
        onLogin(token, isAdmin, points);
        navigate("/");
      }
    } catch (err) {
      toast.error("Error en comunicación con servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 form-container">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="form">
            <Card.Body className="form-text">
              <Card.Title as="h2" className="form-title mb-4">
                Iniciar Sesión
              </Card.Title>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formLoginEmail">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formLoginPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </Form.Group>

                <div className="d-grid mt-3">
                  <Button
                    type="submit"
                    className="form-button"
                    disabled={loading}
                  >
                    {loading ? "Ingresando..." : "Ingresar"}
                  </Button>
                </div>
              </Form>
              <p className="text-center mt-3">
                ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
