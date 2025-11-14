import React, { useState, useEffect, useCallback, useMemo } from "react";
import ItemList from "../itemlist/ItemList";
import ItemModal from "../itemmodal/ItemModal";
import { toast } from "react-toastify";
import {
  Spinner,
  Form,
  Row,
  Col,
  Dropdown,
  ButtonGroup,
  ToggleButton,
  Button,
} from "react-bootstrap";
import { ArrowDown, ArrowUp, PlusCircleFill } from "react-bootstrap-icons";
import { useCart } from "../../../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import "./Products.css";

const productTypes = ["Tinto", "Blanco", "Rosado", "Espumante"];
const API_PRODUCT_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Product";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [viewMode, setViewMode] = useState("active");

  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    document.body.classList.add("products-background");
    return () => document.body.classList.remove("products-background");
  }, []);

  const buildBaseUrl = (forAll = false) => {
    let url = API_PRODUCT_URL;
    if (searchTerm) {
      url = `${API_PRODUCT_URL}/search?name=${encodeURIComponent(searchTerm)}`;
    } else if (selectedType) {
      url = `${API_PRODUCT_URL}/search-by-type?type=${encodeURIComponent(
        selectedType
      )}`;
    }

    const param = `includesoftdeleted=${forAll ? "true" : "false"}`;
    url = url.includes("?") ? `${url}&${param}` : `${url}?${param}`;
    return url;
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [activeResp, allResp] = await Promise.all([
          fetch(`${API_PRODUCT_URL}?includesoftdeleted=false`),
          fetch(`${API_PRODUCT_URL}?includesoftdeleted=true`),
        ]);

        if (!activeResp.ok || !allResp.ok)
          throw new Error("Error al obtener productos");

        const activeData = await activeResp.json();
        const allData = await allResp.json();

        const activeIds = new Set(activeData.map((p) => p.id));
        let merged = allData.map((p) => ({
          ...p,
          isDeleted: !activeIds.has(p.id),
        }));
        if (searchTerm) {
          merged = merged.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else if (selectedType) {
          merged = merged.filter((p) => p.type === selectedType);
        }

        setProducts(merged);
        return;
      }

      const url = buildBaseUrl(false);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Error al cargar productos.");
      const data = await resp.json();
      setProducts(data.map((p) => ({ ...p, isDeleted: false })));
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los productos.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, isAdmin]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedType("");
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type === selectedType ? "" : type);
    setSearchTerm("");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    let list = [...products];

    if (isAdmin) {
      if (viewMode === "active") list = list.filter((p) => !p.isDeleted);
      else if (viewMode === "deleted") list = list.filter((p) => p.isDeleted);
    }

    if (sortConfig.key) {
      list.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [products, sortConfig, isAdmin, viewMode]);

  const handleAction = (product) => {
    if (isAdmin) {
      openModal("edit", product);
    } else if (!token) {
      toast.info("Debes iniciar sesión para agregar productos al carrito.");
      navigate("/login");
    } else if (product.stock <= 0) {
      toast.warn("Sin stock disponible");
    } else {
      addToCart(product, 1);
    }
  };

  const openModal = (mode, product) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const SortIcon = ({ fieldKey }) => {
    if (sortConfig.key !== fieldKey) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ms-1" />
    ) : (
      <ArrowDown className="ms-1" />
    );
  };

  const currentFilterDisplay = selectedType || "Filtrar por Tipo";
  const noProductsFound = !loading && sortedProducts.length === 0;

  return (
    <div className="container mt-4" style={{ color: "white" }}>
      <h3 className="mb-3 text-center">Productos Disponibles</h3>

      <Row className="mb-4 align-items-end g-2">
        <Col md={isAdmin ? 3 : 5}>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Col>

        {isAdmin && (
          <Col md={3} className="text-center">
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
          </Col>
        )}

        <Col md={2}>
          <Dropdown onSelect={handleTypeSelect} className="w-100">
            <Dropdown.Toggle variant="secondary" className="w-100">
              {currentFilterDisplay}
            </Dropdown.Toggle>
            <Dropdown.Menu data-bs-theme="dark" style={{ minWidth: "100%" }}>
              {productTypes.map((type) => (
                <Dropdown.Item
                  key={type}
                  eventKey={type}
                  active={selectedType === type}
                >
                  {type}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        <Col md={2}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" className="w-100">
              Ordenar por <SortIcon fieldKey={sortConfig.key} />
            </Dropdown.Toggle>
            <Dropdown.Menu data-bs-theme="dark">
              <Dropdown.Item onClick={() => handleSort("name")}>
                Nombre <SortIcon fieldKey="name" />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort("price")}>
                Precio <SortIcon fieldKey="price" />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        {isAdmin && (
          <Col md={2} className="text-end">
            <Button
              variant="danger"
              className="w-100"
              onClick={handleOpenCreateModal}
              style={{ whiteSpace: "nowrap" }}
            >
              <PlusCircleFill className="me-1" /> Crear
            </Button>
          </Col>
        )}
      </Row>

      {loading ? (
        <div className="page-center">
          <Spinner animation="border" variant="light" />
          <p className="mt-2">Cargando Listado de Vinos...</p>
        </div>
      ) : noProductsFound ? (
        <p className="text-center mt-5">No se encontraron productos.</p>
      ) : (
        <ItemList
          items={sortedProducts}
          onAction={handleAction}
          onEdit={(p) => openModal("edit", p)}
          onDelete={(p) => openModal("delete", p)}
          isAdmin={isAdmin}
          actionText={isAdmin ? "Editar" : "Agregar al Carrito"}
          emptyListMessage="No hay productos disponibles."
        />
      )}

      <ItemModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        product={selectedProduct}
        mode={modalMode}
        onProductAction={fetchProducts}
      />

      <ItemModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        mode="create"
        itemType="product"
        onProductAction={fetchProducts}
      />
    </div>
  );
};

export default Products;
