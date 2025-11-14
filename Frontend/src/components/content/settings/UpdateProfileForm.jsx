import { useState, useEffect } from "react";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_PROFILE_URL_GET =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/profile";
const API_PROFILE_URL_PUT =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User";

const UpdateProfileForm = () => {
  const [userData, setUserData] = useState({
    name: "",
    lastName: "",
    phoneNumber: "",
    email: "",
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
        const response = await fetch(API_PROFILE_URL_GET, {
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

    const payload = {
      Name: userData.name,
      LastName: userData.lastName,
      PhoneNumber: userData.phoneNumber,
      Email: userData.email,
    };

    try {
      const response = await fetch(API_PROFILE_URL_PUT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="light" />
        <p className="mt-2">Cargando datos...</p>
      </div>
    );
  }

  return (
    <>
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

          <Form.Group as={Col} md="6" controlId="formSettingsLastName">
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

        <Form.Group className="mb-3" controlId="formSettingsPhoneNumber">
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
    </>
  );
};

export default UpdateProfileForm;
