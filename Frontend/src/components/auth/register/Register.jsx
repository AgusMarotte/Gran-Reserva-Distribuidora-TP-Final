import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("register-background");
    return () => {
      document.body.classList.remove("register-background");
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    return /^.{8,}$/.test(password);
  };

  const validatePhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emptyForm = [];
    if (!formData.name) emptyForm.push("Nombre");
    if (!formData.lastName) emptyForm.push("Apellido");
    if (!formData.phoneNumber) emptyForm.push("Número de Teléfono");
    if (!formData.email) emptyForm.push("E-mail");
    if (!formData.password) emptyForm.push("Contraseña");

    if (emptyForm.length > 0) {
      let message = "";
      if (emptyForm.length === 1) {
        message = `El campo "${emptyForm[0]}" no puede estar vacío.`;
      } else {
        const last = emptyForm.pop();
        message = `Los campos "${emptyForm.join('", "')}" ${
          last === "E-mail" ? "e" : "y"
        } "${last}" no pueden estar vacíos.`;
      }
      toast.error(message);
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("El e-mail debe tener un formato válido.");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error("El número de teléfono debe tener 10 dígitos.");
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = "Error al registrarse. Intenta nuevamente.";
        try {
          const errorData = JSON.parse(responseText);
          errorMsg =
            errorData.error ||
            errorData.message ||
            "Error al registrarse. Intenta nuevamente.";
        } catch (jsonError) {
          if (responseText && responseText.length < 100)
            errorMsg = responseText;
        }
        toast.error(errorMsg);
      } else {
        toast.success("Registro exitoso. Ya puedes iniciar sesión.");
        navigate("/login");
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
                Registrar Cuenta
              </Card.Title>

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="formRegisterName">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nombre"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" controlId="formRegisterLastName">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Apellido"
                    />
                  </Form.Group>
                </Row>

                <Form.Group
                  className="mb-3"
                  controlId="formRegisterPhoneNumber"
                >
                  <Form.Label>Número de Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="341XXXXXXX"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterEmail">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterPassword">
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
                    {loading ? "Creando Cuenta..." : "Registrarse"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
