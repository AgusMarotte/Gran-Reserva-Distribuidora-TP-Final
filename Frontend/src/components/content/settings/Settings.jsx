import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const API_PROFILE_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/profile";
const API_PASSWORD_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/change-password";

const Settings = ({ onLogin }) => {
  const [userData, setUserData] = useState({
    name: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(API_PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos del usuario.");
        }

        const data = await response.json();
        setUserData({
          name: data.name || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
        });
      } catch (err) {
        toast.error(err.message || "Error al cargar la configuración.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [token, navigate]);

  const handleDataChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const validatePhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber);
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!validatePhoneNumber(userData.phoneNumber)) {
      toast.error("El número de teléfono debe tener 10 dígitos.");
      setSaving(false);
      return;
    }
    if (!validateEmail(userData.email)) {
      toast.error("El Email debe tener un formato válido.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(API_PROFILE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = "Error al actualizar los datos.";
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          errorMsg = errorText || "Error desconocido al actualizar.";
        }
        throw new Error(errorMsg);
      }

      toast.success("Datos de usuario actualizados con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (passwordData.newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(API_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = "Error al cambiar la contraseña.";
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          errorMsg = errorText || "Error desconocido al actualizar.";
        }
        throw new Error(errorMsg);
      }

      toast.success(
        "Contraseña actualizada con éxito. Inicia sesión nuevamente."
      );
      // For security, force re-login
      setSaving(false);
      onLogin(null, false); // Llama a onLogin con valores nulos para forzar el logout
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Error al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <Spinner animation="border" variant="light" />
        <p className="mt-2">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <Container className="mt-5 form-container">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="form p-4">
            <Card.Title as="h2" className="form-title mb-4">
              Configuración de Cuenta
            </Card.Title>

            <Row>
              {/* Columna de Datos Personales */}
              <Col md={6}>
                <h5 className="mb-3">Actualizar Datos Personales</h5>
                <Form onSubmit={handleSaveData} className="mb-4">
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6" controlId="formSettingsName">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleDataChange}
                        required
                        className="bg-dark text-white border-secondary"
                      />
                    </Form.Group>

                    <Form.Group
                      as={Col}
                      md="6"
                      controlId="formSettingsLastName"
                    >
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleDataChange}
                        required
                        className="bg-dark text-white border-secondary"
                      />
                    </Form.Group>
                  </Row>

                  <Form.Group
                    className="mb-3"
                    controlId="formSettingsPhoneNumber"
                  >
                    <Form.Label>Número de Teléfono (10 dígitos)</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={userData.phoneNumber}
                      onChange={handleDataChange}
                      placeholder="341XXXXXXX"
                      required
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formSettingsEmail">
                    <Form.Label>E-mail</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleDataChange}
                      required
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>

                  <div className="d-grid mt-3">
                    <Button
                      type="submit"
                      variant="danger"
                      className="form-button"
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </Form>
              </Col>

              {/* Columna de Cambio de Contraseña */}
              <Col md={6}>
                <h5 className="mb-3">Cambiar Contraseña</h5>
                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3" controlId="formPasswordCurrent">
                    <Form.Label>Contraseña Actual</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPasswordNew">
                    <Form.Label>
                      Nueva Contraseña (mínimo 8 caracteres)
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>

                  <div className="d-grid mt-3">
                    <Button
                      type="submit"
                      variant="danger"
                      className="form-button"
                      disabled={saving}
                    >
                      {saving ? "Cambiando..." : "Actualizar Contraseña"}
                    </Button>
                  </div>
                </Form>
                <p className="text-secondary mt-3">
                  *Al cambiar tu contraseña, deberás iniciar sesión nuevamente.
                </p>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
