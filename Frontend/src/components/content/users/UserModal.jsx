import { useState, useEffect } from "react";
import { Modal, Button, Spinner, Form, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { PencilSquare, TrashFill, ArrowClockwise } from "react-bootstrap-icons";

const API_USER_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User";

const UserModal = ({
  show,
  onHide,
  user,
  currentUserId,
  token,
  onUserUpdate,
}) => {
  const [modalMode, setModalMode] = useState("view");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [pointsData, setPointsData] = useState({
    amount: 0,
    operation: "Add",
  });
  const [pointsModified, setPointsModified] = useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  useEffect(() => {
    if (user) {
      if (modalMode === "edit") {
        setFormData({
          name: user.name,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
        });
        setPointsData({ amount: 0, operation: "Add" });
        setPointsModified(false);
      }
      if (modalMode === "delete") {
        setIsPermanentDelete(user.isDeleted);
      }
    }
  }, [user, modalMode]);

  const handleClose = () => {
    if (saving) return;
    setModalMode("view");
    onHide();
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePointsChange = (e) => {
    setPointsModified(true);
    const { name, value } = e.target;
    setPointsData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.name.trim() || !formData.lastName.trim()) {
      toast.error("Nombre y Apellido son obligatorios.");
      setSaving(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error("El número de teléfono debe tener 10 dígitos.");
      setSaving(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("El formato de Email no es válido.");
      setSaving(false);
      return;
    }

    if (pointsModified && pointsData.amount < 0) {
      toast.error("La cantidad de puntos no puede ser negativa.");
      setSaving(false);
      return;
    }

    try {
      const userResp = await fetch(`${API_USER_URL}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!userResp.ok) {
        const errorText = await userResp.text();
        throw new Error(errorText || "Error al actualizar el usuario.");
      }

      if (user.role === "User" && pointsModified) {
        const pointsResp = await fetch(`${API_USER_URL}/${user.id}/points`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            operation: pointsData.operation,
            amount: pointsData.amount,
          }),
        });

        if (!pointsResp.ok) {
          const errorText = await pointsResp.text();
          throw new Error(errorText || "Error al actualizar puntos.");
        }
      }

      toast.success(`Usuario ${formData.name} actualizado con éxito.`);
      handleClose();
      onUserUpdate();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_USER_URL}/${user.id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al restaurar.");
      }

      toast.success(`${user.name} ha sido restaurado correctamente.`);
      handleClose();
      onUserUpdate();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setSaving(true);

    const permanently = user.isDeleted || isPermanentDelete;
    const deleteUrl = `${API_USER_URL}/${user.id}?permanently=${permanently}`;

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al eliminar.");
      }

      toast.success(
        `${user.name} ha sido ${
          permanently ? "eliminado permanentemente" : "dado de baja"
        }.`
      );
      handleClose();
      onUserUpdate();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    if (!user) return "";
    if (modalMode === "edit" && !user.isDeleted) return "Editar Usuario";
    if (modalMode === "edit" && user.isDeleted) return "Restaurar Usuario";
    if (modalMode === "delete") return "Confirmar Eliminación";
    return `${user.name} ${user.lastName}`;
  };

  const renderModalContent = () => {
    if (!user) return null;

    if (modalMode === "view") {
      return (
        <>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {user.phoneNumber && (
            <p>
              <strong>Teléfono:</strong> {user.phoneNumber}
            </p>
          )}
          <p>
            <strong>Rol:</strong> {user.role || "Desconocido"}
          </p>
          {user.points !== null && user.points !== undefined && (
            <p>
              <strong>Puntos:</strong> {user.points}
            </p>
          )}
          {user.isDeleted && (
            <p className="text-danger">
              Este usuario está eliminado (borrado lógico).
            </p>
          )}
        </>
      );
    }

    if (modalMode === "edit" && user.isDeleted) {
      return (
        <>
          <p className="text-warning">Este usuario está dado de baja.</p>
          <p>
            ¿Deseas restaurar a "{user?.name} {user?.lastName}" y activar su
            cuenta?
          </p>
        </>
      );
    }

    if (modalMode === "edit") {
      return (
        <Form onSubmit={handleSaveEdit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formUserName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formUserLastName">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                required
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="formUserEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formUserPhone">
            <Form.Label>Teléfono (10 dígitos)</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleFormChange}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>

          {user?.role === "User" && (
            <>
              <hr />
              <h5 className="mb-3">Modificar Puntos</h5>
              <p>
                Puntos Actuales: <strong>{user.points}</strong>
              </p>
              <Row>
                <Form.Group as={Col} md={6} controlId="formUserPointsOp">
                  <Form.Label>Operación</Form.Label>
                  <Form.Select
                    name="operation"
                    value={pointsData.operation}
                    onChange={handlePointsChange}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="Add">Sumar</option>
                    <option value="Subtract">Restar</option>
                    <option value="Set">Establecer</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="formUserPointsAmount">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={pointsData.amount}
                    onChange={handlePointsChange}
                    min="0"
                    className="bg-dark text-white border-secondary"
                  />
                </Form.Group>
              </Row>
            </>
          )}
        </Form>
      );
    }

    if (modalMode === "delete") {
      return (
        <Form>
          <p>
            ¿Estás seguro de que deseas eliminar a "{user?.name}{" "}
            {user?.lastName}
            "?
          </p>
          {!user?.isDeleted && (
            <>
              <Form.Check
                type="checkbox"
                id="permanent-delete-check"
                label="Eliminación permanente (¡No se puede deshacer!)"
                checked={isPermanentDelete}
                onChange={(e) => setIsPermanentDelete(e.target.checked)}
                className="text-danger"
              />
              <p className="text-secondary mt-2">
                Si no marcas la casilla, solo se dará de baja (Soft Delete).
              </p>
            </>
          )}
          {user?.isDeleted && (
            <p className="text-danger">
              Este usuario ya está dado de baja. Al confirmar, se eliminará
              PERMANENTEMENTE del sistema.
            </p>
          )}
        </Form>
      );
    }
  };

  const renderModalFooter = () => {
    if (!user) return null;
    const isSelf = user.id === currentUserId;

    if (modalMode === "view") {
      return (
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            variant="dark"
            className="form-button"
            onClick={() => setModalMode("delete")}
            disabled={saving || isSelf}
            title={isSelf ? "No puedes eliminarte a ti mismo" : ""}
          >
            <TrashFill /> Eliminar
          </Button>
          <Button
            variant="dark"
            className="form-button"
            onClick={() => setModalMode("edit")}
            disabled={saving || isSelf}
            title={isSelf ? "No puedes editarte a ti mismo desde aquí" : ""}
          >
            {user.isDeleted ? (
              <>
                <ArrowClockwise /> Restaurar
              </>
            ) : (
              <>
                <PencilSquare /> Editar
              </>
            )}
          </Button>
        </>
      );
    }

    if (modalMode === "edit" && user.isDeleted) {
      return (
        <>
          <Button
            variant="secondary"
            onClick={() => setModalMode("view")}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="dark"
            className="form-button"
            onClick={handleRestore}
            disabled={saving}
          >
            {saving ? (
              <Spinner as="span" size="sm" />
            ) : (
              <>
                <ArrowClockwise /> Restaurar Usuario
              </>
            )}
          </Button>
        </>
      );
    }

    if (modalMode === "edit") {
      return (
        <>
          <Button
            variant="secondary"
            onClick={() => setModalMode("view")}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="dark"
            className="form-button"
            onClick={handleSaveEdit}
            disabled={saving}
          >
            {saving ? <Spinner as="span" size="sm" /> : "Guardar Cambios"}
          </Button>
        </>
      );
    }

    if (modalMode === "delete") {
      return (
        <>
          <Button
            variant="secondary"
            onClick={() => setModalMode("view")}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="dark"
            className="form-button"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? (
              <Spinner as="span" size="sm" />
            ) : (
              <>
                <TrashFill /> Confirmar Eliminación
              </>
            )}
          </Button>
        </>
      );
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered data-bs-theme="dark">
      <Modal.Header closeButton>
        <Modal.Title>{getModalTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderModalContent()}</Modal.Body>
      <Modal.Footer>{renderModalFooter()}</Modal.Footer>
    </Modal>
  );
};

export default UserModal;
