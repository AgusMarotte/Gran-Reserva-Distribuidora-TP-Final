import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ListGroup,
  Modal,
  Button,
  Spinner,
  Form,
  ToggleButton,
  ButtonGroup,
  Col,
  Row,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  PencilSquare,
  TrashFill,
  ArrowClockwise,
  PersonFillAdd,
} from "react-bootstrap-icons";
import "./Users.css";

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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [viewMode, setViewMode] = useState("active");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState(initialNewUserState);

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      try {
        const base64Url = t.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        setCurrentUserId(parseInt(payload.sub || payload.nameid, 10));
      } catch (e) {
        console.error("Failed to parse token:", e);
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (!isAdmin) {
        const resp = await fetch(API_USER_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error("Error al obtener usuarios");
        const data = await resp.json();
        setUsers(data.map((u) => ({ ...u, isDeleted: false })));
        return;
      }

      const [activeResp, allResp] = await Promise.all([
        fetch(`${API_USER_URL}?includesoftdeleted=false`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_USER_URL}?includesoftdeleted=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!activeResp.ok || !allResp.ok)
        throw new Error("Error al obtener usuarios");

      const activeData = await activeResp.json();
      const allData = await allResp.json();

      const activeIds = new Set(activeData.map((u) => u.id));
      const merged = allData.map((u) => ({
        ...u,
        isDeleted: !activeIds.has(u.id),
      }));

      setUsers(merged);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al cargar usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser && modalMode === "edit") {
      setFormData({
        name: selectedUser.name,
        lastName: selectedUser.lastName,
        phoneNumber: selectedUser.phoneNumber,
        email: selectedUser.email,
      });
      setPointsData({ amount: 0, operation: "Add" });
      setPointsModified(false);
    }
    if (selectedUser && modalMode === "delete") {
      setIsPermanentDelete(selectedUser.isDeleted);
    }
  }, [selectedUser, modalMode]);

  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (isAdmin) {
      if (viewMode === "active") list = list.filter((u) => !u.isDeleted);
      else if (viewMode === "deleted") list = list.filter((u) => u.isDeleted);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      if (searchType === "name") {
        list = list.filter((u) =>
          `${u.name || ""} ${u.lastName || ""}`.toLowerCase().includes(query)
        );
      } else if (searchType === "id") {
        list = list.filter((u) => String(u.id).includes(query));
      } else if (searchType === "email") {
        list = list.filter((u) => u.email?.toLowerCase().includes(query));
      }
    }

    return list;
  }, [users, viewMode, searchQuery, searchType, isAdmin]);

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSaving(false);
  };

  const handleClear = () => setSearchQuery("");

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

  const handleShowCreateModal = () => {
    setNewUserFormData(initialNewUserState);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSaving(false);
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
      handleCloseCreateModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
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
      const userResp = await fetch(`${API_USER_URL}/${selectedUser.id}`, {
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

      if (selectedUser.role === "User" && pointsModified) {
        const pointsResp = await fetch(
          `${API_USER_URL}/${selectedUser.id}/points`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              operation: pointsData.operation,
              amount: pointsData.amount,
            }),
          }
        );

        if (!pointsResp.ok) {
          const errorText = await pointsResp.text();
          throw new Error(errorText || "Error al actualizar puntos.");
        }
      }

      toast.success(`Usuario ${formData.name} actualizado con éxito.`);
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${API_USER_URL}/${selectedUser.id}/restore`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al restaurar.");
      }

      toast.success(`${selectedUser.name} ha sido restaurado correctamente.`);
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSaving(true);

    const permanently = selectedUser.isDeleted || isPermanentDelete;
    const deleteUrl = `${API_USER_URL}/${selectedUser.id}?permanently=${permanently}`;

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
        `${selectedUser.name} ha sido ${
          permanently ? "eliminado permanentemente" : "dado de baja"
        }.`
      );
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    if (modalMode === "edit" && !selectedUser.isDeleted)
      return "Editar Usuario";
    if (modalMode === "edit" && selectedUser.isDeleted)
      return "Restaurar Usuario";
    if (modalMode === "delete") return "Confirmar Eliminación";
    return `${selectedUser.name} ${selectedUser.lastName}`;
  };

  const renderModalContent = () => {
    if (modalMode === "view") {
      return (
        <>
          <p>
            <strong>ID:</strong> {selectedUser.id}
          </p>
          <p>
            <strong>Email:</strong> {selectedUser.email}
          </p>
          {selectedUser.phoneNumber && (
            <p>
              <strong>Teléfono:</strong> {selectedUser.phoneNumber}
            </p>
          )}
          <p>
            <strong>Rol:</strong> {selectedUser.role || "Desconocido"}
          </p>
          {selectedUser.points !== null &&
            selectedUser.points !== undefined && (
              <p>
                <strong>Puntos:</strong> {selectedUser.points}
              </p>
            )}
          {selectedUser.isDeleted && (
            <p className="text-danger">
              Este usuario está eliminado (borrado lógico).
            </p>
          )}
        </>
      );
    }

    if (modalMode === "edit" && selectedUser.isDeleted) {
      return (
        <>
          <p className="text-warning">Este usuario está dado de baja.</p>
          <p>
            ¿Deseas restaurar a "{selectedUser?.name} {selectedUser?.lastName}"
            y activar su cuenta?
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
                name="name"
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

          {selectedUser?.role === "User" && (
            <>
              <hr />
              <h5 className="mb-3">Modificar Puntos</h5>
              <p>
                Puntos Actuales: <strong>{selectedUser.points}</strong>
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
            ¿Estás seguro de que deseas eliminar a "{selectedUser?.name}{" "}
            {selectedUser?.lastName}"?
          </p>
          {!selectedUser?.isDeleted && (
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
          {selectedUser?.isDeleted && (
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
    const isSelf = selectedUser.id === currentUserId;

    if (modalMode === "view") {
      return (
        <>
          <Button variant="secondary" onClick={handleCloseModal}>
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
            {selectedUser.isDeleted ? (
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

    if (modalMode === "edit" && selectedUser.isDeleted) {
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
    <div className="container text-white py-5">
      <h2 className="mb-4 fw-bold">Usuarios</h2>

      <div className="d-flex gap-2 mb-4 align-items-center">
        {isAdmin && (
          <ButtonGroup>
            <ToggleButton
              id="view-active"
              type="radio"
              variant="outline-light"
              name="view"
              value="active"
              checked={viewMode === "active"}
              onChange={() => setViewMode("active")}
            >
              Activos
            </ToggleButton>
            <ToggleButton
              id="view-all"
              type="radio"
              variant="outline-light"
              name="view"
              value="all"
              checked={viewMode === "all"}
              onChange={() => setViewMode("all")}
            >
              Todos
            </ToggleButton>
            <ToggleButton
              id="view-deleted"
              type="radio"
              variant="outline-light"
              name="view"
              value="deleted"
              checked={viewMode === "deleted"}
              onChange={() => setViewMode("deleted")}
            >
              Eliminados
            </ToggleButton>
          </ButtonGroup>
        )}

        <ButtonGroup>
          <ToggleButton
            id="search-name"
            type="radio"
            variant="outline-light"
            name="searchType"
            value="name"
            checked={searchType === "name"}
            onChange={() => setSearchType("name")}
            style={{ whiteSpace: "nowrap" }}
          >
            Nombre / Apellido
          </ToggleButton>
          <ToggleButton
            id="search-id"
            type="radio"
            variant="outline-light"
            name="searchType"
            value="id"
            checked={searchType === "id"}
            onChange={() => setSearchType("id")}
          >
            ID
          </ToggleButton>
          <ToggleButton
            id="search-email"
            type="radio"
            variant="outline-light"
            name="searchType"
            value="email"
            checked={searchType === "email"}
            onChange={() => setSearchType("email")}
          >
            Email
          </ToggleButton>
        </ButtonGroup>

        <Form.Control
          type="text"
          placeholder="Ingresá el valor a buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="users-input flex-grow-1"
        />

        <Button
          variant="outline-light"
          className="users-btn"
          onClick={handleShowCreateModal}
          style={{ whiteSpace: "nowrap" }}
        >
          <PersonFillAdd /> Crear Usuario
        </Button>

        <Button variant="outline-light" onClick={handleClear}>
          Limpiar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <ListGroup>
          {filteredUsers.map((u) => (
            <ListGroup.Item
              key={u.id}
              action
              onClick={() => handleShowModal(u)}
              className={`bg-dark text-white border-secondary mb-2 rounded ${
                u.isDeleted ? "deleted-item" : ""
              }`}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    {u.name} {u.lastName}
                    {u.isDeleted && (
                      <span
                        className="text-danger ms-2"
                        style={{ fontSize: "0.8em" }}
                      >
                        (Eliminado)
                      </span>
                    )}
                  </h5>
                  <small className="text-secondary">{u.email}</small>
                  <div className="users-role small fw-bold">{u.role}</div>
                </div>
                <div className="text-end">
                  {u.role === "User" && (
                    <h5 className="mb-0">{u.points} Puntos</h5>
                  )}
                  <small className="text-secondary">ID: {u.id}</small>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {selectedUser && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          data-bs-theme="dark"
        >
          <Modal.Header closeButton>
            <Modal.Title>{getModalTitle()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{renderModalContent()}</Modal.Body>
          <Modal.Footer>{renderModalFooter()}</Modal.Footer>
        </Modal>
      )}

      <Modal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        centered
        data-bs-theme="dark"
      >
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
          <Button
            variant="secondary"
            onClick={handleCloseCreateModal}
            disabled={saving}
          >
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
    </div>
  );
};

export default Users;
