import { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_PASSWORD_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/User/change-password";

const UpdatePasswordForm = ({ onLogin }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
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

  return (
    <>
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
          <Form.Label>Nueva Contraseña (mínimo 8 caracteres)</Form.Label>
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
    </>
  );
};

export default UpdatePasswordForm;
