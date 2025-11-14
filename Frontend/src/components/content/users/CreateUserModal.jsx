import { useState } from "react";
import { Modal, Button, Spinner, Form, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";

const API_USER_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User";

const initialNewUserState = {
  name: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  password: "",
  role: "User",
};

const CreateUserModal = ({ show, onHide, onUserCreated, token }) => {
  const [saving, setSaving] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState(initialNewUserState);

  const handleHide = () => {
    if (saving) return;
    setNewUserFormData(initialNewUserState);
    onHide();
  };

  const handleNewUserFormChange = (e) => {
    setNewUserFormData({
      ...newUserFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { name, lastName, phoneNumber, email, password, role } =
      newUserFormData;

    if (
      !name.trim() ||
      !lastName.trim() ||
      !phoneNumber.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      toast.error("Todos los campos son obligatorios.");
      setSaving(false);
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("El número de teléfono debe tener 10 dígitos.");
      setSaving(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("El formato de Email no es válido.");
      setSaving(false);
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      setSaving(false);
      return;
    }

    const { role: userRole, ...userData } = newUserFormData;
    let url = API_USER_URL;
    const body = JSON.stringify(userData);

    if (userRole === "Admin" || userRole === "SuperAdmin") {
      url = `${API_USER_URL}/admin?role=${userRole}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al crear el usuario.");
      }

      toast.success(`Usuario ${name} creado con éxito.`);
      onUserCreated();
      handleHide();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleHide} centered data-bs-theme="dark">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="createUserForm" onSubmit={handleCreateUser}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formCreateName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newUserFormData.name}
                onChange={handleNewUserFormChange}
                required
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formCreateLastName">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={newUserFormData.lastName}
                onChange={handleNewUserFormChange}
                required
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="formCreateEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newUserFormData.email}
              onChange={handleNewUserFormChange}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCreatePhone">
            <Form.Label>Teléfono (10 dígitos)</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={newUserFormData.phoneNumber}
              onChange={handleNewUserFormChange}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCreatePassword">
            <Form.Label>Contraseña (mín. 8 caracteres)</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={newUserFormData.password}
              onChange={handleNewUserFormChange}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCreateRole">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              name="role"
              value={newUserFormData.role}
              onChange={handleNewUserFormChange}
              className="bg-dark text-white border-secondary"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="dark"
          className="form-button"
          type="submit"
          form="createUserForm"
          disabled={saving}
        >
          {saving ? <Spinner as="span" size="sm" /> : "Guardar Usuario"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUserModal;
