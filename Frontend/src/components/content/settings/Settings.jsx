import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const API_PROFILE_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/profile";
const API_PASSWORD_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/change-password";
const API_DELETE_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User?permanently=false";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

    if (!userData.name.trim()) {
      toast.error("El Nombre no puede estar vacío.");
      setSaving(false);
      return;
    }
    if (!userData.lastName.trim()) {
      toast.error("El Apellido no puede estar vacío.");
      setSaving(false);
      return;
    }

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
      setSaving(false);
      onLogin(null, false);
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Error al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_DELETE_URL, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = "Error al eliminar la cuenta.";
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          errorMsg = errorText || "Error desconocido.";
        }
        throw new Error(errorMsg);
      }

      toast.success("Tu cuenta ha sido eliminada correctamente.");
      setShowDeleteModal(false);
      onLogin(null, false);
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Error al eliminar la cuenta.");
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

              <Col md={6}>
                <h5 className="mb-3">Cambiar Contraseña</h5>
                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3" controlId="formPasswordCurrent">
                    <Form.Label>Contraseña Actual</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      onChange={handlePasswordChange}
                      className="bg-dark text-white border-secondary"
                      placeholder="••••••••"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPasswordNew">
                    <Form.Label>
                      Nueva Contraseña (mínimo 8 caracteres)
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      onChange={handlePasswordChange}
                      className="bg-dark text-white border-secondary"
                      placeholder="••••••••"
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
                  Al cambiar tu contraseña, deberás iniciar sesión nuevamente.
                </p>
              </Col>
            </Row>

            <hr className="my-4" />
            <Row className="justify-content-center">
              <Col md={6}>
                <h5 className="mb-3 text-danger">Zona de Peligro</h5>
                <p className="text-secondary">
                  Esta acción dará de baja tu cuenta y no podrás acceder a ella.
                </p>
                <div className="d-grid">
                  <Button
                    variant="outline-danger"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={saving}
                  >
                    Eliminar mi cuenta
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        data-bs-theme="dark"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación de Cuenta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar tu cuenta?</p>
          <p className="text-warning">
            Perderás acceso a tu historial de pedidos, tus puntos acumulados y
            la posibilidad de realizar compras.
          </p>
          <p className="text-danger fw-bold">Esta acción es definitiva.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={saving}
          >
            {saving ? "Eliminando..." : "Sí, eliminar mi cuenta"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Settings;
