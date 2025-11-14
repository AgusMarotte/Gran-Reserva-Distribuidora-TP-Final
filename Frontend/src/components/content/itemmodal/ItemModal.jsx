import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

const API_BASE_PRODUCT =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Product";
const API_BASE_REWARD =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Reward";
const productTypes = ["Tinto", "Blanco", "Rosado", "Espumante"];

const emptyProductForm = {
  name: "",
  type: "Tinto",
  price: 0,
  stock: 0,
  imageUrl: "",
};

const emptyRewardForm = {
  name: "",
  description: "",
  pointsRequired: 0,
  stock: 0,
  imageUrl: "",
};

const ItemModal = ({
  show,
  handleClose,
  product,
  mode,
  itemType = "product",
  onProductAction,
}) => {
  const [formData, setFormData] = useState({});
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const isSoftDeleted = product?.isDeleted === true;
  const isReward =
    itemType === "reward" || product?.pointsRequired !== undefined;

  const API_BASE_URL = isReward ? API_BASE_REWARD : API_BASE_PRODUCT;
  const API_RESTORE_URL = `${API_BASE_URL}/${product?.id}/restore`;

  useEffect(() => {
    if (show) {
      if (mode === "edit" && product) {
        setFormData({
          name: product.name,
          type: product.type,
          price: isReward ? undefined : product.price,
          description: isReward ? product.description : undefined,
          pointsRequired: isReward ? product.pointsRequired : undefined,
          stock: product.stock,
          imageUrl: product.imageUrl,
        });
      } else if (mode === "create") {
        setFormData(isReward ? emptyRewardForm : emptyProductForm);
      } else if (mode === "delete") {
        setIsPermanentDelete(isSoftDeleted);
      }
    }
  }, [product, mode, isSoftDeleted, isReward, show]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        ["price", "stock", "pointsRequired"].includes(name) && value
          ? Number(value)
          : value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.name?.trim() ||
      (isReward && formData.pointsRequired < 0) ||
      (!isReward && formData.price < 0) ||
      formData.stock < 0
    ) {
      toast.error(
        "El nombre no puede estar vacío y los valores numéricos no pueden ser negativos."
      );
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al actualizar.");
      }
      toast.success(`${formData.name} actualizado con éxito.`);
    } catch (err) {
      throw err;
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al crear.");
      }
      toast.success(`${formData.name} creado con éxito.`);
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);

    try {
      if (mode === "edit") {
        await handleUpdate();
      } else if (mode === "create") {
        await handleCreate();
      }
      onProductAction();
      handleClose();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    try {
      const response = await fetch(API_RESTORE_URL, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al restaurar.");
      }

      toast.success(
        `${product.name} ha sido restaurado${
          isReward ? "a" : ""
        } correctamente.`
      );
      onProductAction();
      handleClose();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setSaving(true);

    const permanently = isSoftDeleted || isPermanentDelete;
    const deleteUrl = `${API_BASE_URL}/${product.id}?permanently=${permanently}`;

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error desconocido al eliminar.");
      }

      toast.success(
        `${product.name} ha sido ${
          permanently ? "eliminado permanentemente" : "dado de baja"
        }.`
      );
      onProductAction();
      handleClose();
    } catch (err) {
      toast.error(err.message || "Error al comunicarse con la API.");
    } finally {
      setSaving(false);
    }
  };

  const renderEditForm = () => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleEditChange}
          required
          className="bg-dark text-white border-secondary"
        />
      </Form.Group>

      {isReward && (
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description || ""}
            onChange={handleEditChange}
            className="bg-dark text-white border-secondary"
          />
        </Form.Group>
      )}

      {!isReward && (
        <Form.Group className="mb-3">
          <Form.Label>Tipo</Form.Label>
          <Form.Select
            name="type"
            value={formData.type || ""}
            onChange={handleEditChange}
            required
            className="bg-dark text-white border-secondary"
          >
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <Row className="mb-3">
        {!isReward && (
          <Form.Group as={Col} controlId="editPrice">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price ?? 0}
              onChange={handleEditChange}
              min="0"
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        )}

        {isReward && (
          <Form.Group as={Col} controlId="editPointsRequired">
            <Form.Label>Puntos Requeridos</Form.Label>
            <Form.Control
              type="number"
              name="pointsRequired"
              value={formData.pointsRequired ?? 0}
              onChange={handleEditChange}
              min="0"
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        )}

        <Form.Group as={Col} controlId="editStock">
          <Form.Label>Stock</Form.Label>
          <Form.Control
            type="number"
            name="stock"
            value={formData.stock ?? 0}
            onChange={handleEditChange}
            min="0"
            required
            className="bg-dark text-white border-secondary"
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>URL Imagen</Form.Label>
        <Form.Control
          type="text"
          name="imageUrl"
          value={formData.imageUrl || ""}
          onChange={handleEditChange}
          required
          className="bg-dark text-white border-secondary"
        />
      </Form.Group>
    </Form>
  );

  const renderRestoreUI = () => (
    <>
      <p className="text-warning">
        Este {isReward ? "recompensa" : "producto"} está dado de baja.
      </p>
      <p>
        ¿Deseas restaurar "{product?.name}" y devolverlo al catálogo activo?
      </p>
    </>
  );

  const renderDeleteForm = () => (
    <Form>
      <p>
        ¿Estás seguro de que deseas eliminar{" "}
        {isReward ? "la recompensa" : "el producto"} "{product?.name}"?
      </p>

      {!isSoftDeleted && (
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

      {isSoftDeleted && (
        <p className="text-danger">
          Este {isReward ? "recompensa" : "producto"} ya está dado de baja. Al
          confirmar, se eliminará PERMANENTEMENTE del sistema.
        </p>
      )}
    </Form>
  );

  const renderModalContent = () => {
    if (mode === "edit") {
      return isSoftDeleted ? renderRestoreUI() : renderEditForm();
    }
    if (mode === "create") {
      return renderEditForm();
    }
    if (mode === "delete") return renderDeleteForm();
    return null;
  };

  const renderModalFooter = () => {
    if (mode === "edit") {
      const actionVariant = isSoftDeleted ? "success" : "danger";
      const actionText = isSoftDeleted
        ? `Restaurar ${isReward ? "Recompensa" : "Producto"}`
        : "Guardar Cambios";
      const savingText = isSoftDeleted ? "Restaurando..." : "Guardando...";

      return (
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant={actionVariant}
            onClick={isSoftDeleted ? handleRestore : handleSubmit}
            disabled={saving}
            type={isSoftDeleted ? "button" : "submit"}
            form={isSoftDeleted ? "" : "item-form"}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                {savingText}
              </>
            ) : (
              actionText
            )}
          </Button>
        </>
      );
    }

    if (mode === "create") {
      return (
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={saving}
            type="submit"
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Creando...
              </>
            ) : (
              "Crear"
            )}
          </Button>
        </>
      );
    }

    if (mode === "delete") {
      return (
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Eliminando...
              </>
            ) : (
              "Confirmar Eliminación"
            )}
          </Button>
        </>
      );
    }
    return null;
  };

  const getModalTitle = () => {
    if (mode === "create") {
      return `Crear ${isReward ? "Recompensa" : "Producto"}`;
    }
    if (mode === "edit") {
      return isSoftDeleted
        ? `Restaurar ${isReward ? "Recompensa" : "Producto"}`
        : `Editar ${isReward ? "Recompensa" : "Producto"}: ${product?.name}`;
    }
    return "Confirmar Eliminación";
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

export default ItemModal;
