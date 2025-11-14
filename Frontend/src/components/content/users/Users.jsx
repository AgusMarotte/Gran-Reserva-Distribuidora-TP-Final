import { useState, useEffect, useCallback, useMemo } from "react";
import { ListGroup, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { PersonFillAdd } from "react-bootstrap-icons";
import "./Users.css";
import AdminSearchControls from "../../ui/adminsearchcontrols/AdminSearchControls";
import CreateUserModal from "./CreateUserModal";
import UserModal from "./UserModal";

const API_USER_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [viewMode, setViewMode] = useState("active");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    setError(null);
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleShowCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleClear = () => setSearchQuery("");

  const viewModeConfig = {
    viewMode,
    onViewModeChange: setViewMode,
    options: [
      { value: "active", label: "Activos" },
      { value: "all", label: "Todos" },
      { value: "deleted", label: "Eliminados" },
    ],
  };

  const searchTypeConfig = {
    searchType,
    onSearchTypeChange: setSearchType,
    options: [
      { value: "name", label: "Nombre / Apellido" },
      { value: "id", label: "ID" },
      { value: "email", label: "Email" },
    ],
  };

  const searchQueryConfig = {
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    placeholder: "Ingresá el valor a buscar...",
  };

  const createButtonConfig = {
    label: "Crear Usuario",
    icon: <PersonFillAdd />,
    onClick: handleShowCreateModal,
  };

  const clearButtonConfig = {
    label: "Limpiar",
    onClick: handleClear,
  };

  return (
    <div className="container text-white py-5">
      <h2 className="mb-4 fw-bold">Usuarios</h2>

      <AdminSearchControls
        viewModeConfig={isAdmin ? viewModeConfig : null}
        searchTypeConfig={searchTypeConfig}
        searchQueryConfig={searchQueryConfig}
        createButtonConfig={createButtonConfig}
        clearButtonConfig={clearButtonConfig}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">Error: {error}</div>
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
        <UserModal
          show={showModal}
          onHide={handleCloseModal}
          user={selectedUser}
          currentUserId={currentUserId}
          token={token}
          onUserUpdate={fetchUsers}
        />
      )}

      <CreateUserModal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        token={token}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};

export default Users;
