import React, { useState, useEffect, useCallback, useMemo } from "react";
import ItemList from "../itemlist/ItemList";
import { toast } from "react-toastify";
import { Spinner, Form, Row, Col, Dropdown } from "react-bootstrap";
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import { useCart } from "../cart/Cart.jsx";
import "./Products.css";

const productTypes = ["Tinto", "Blanco", "Rosado", "Espumante"];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const { addToCart } = useCart();

  useEffect(() => {
    document.body.classList.add("products-background");
    return () => {
      document.body.classList.remove("products-background");
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let url =
      "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/product";

    if (searchTerm) {
      url = `${url}/search?name=${encodeURIComponent(searchTerm)}`;
    } else if (selectedType) {
      url = `${url}/search-by-type?type=${encodeURIComponent(selectedType)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos");
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Error al cargar los productos.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType]);

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
    let sortableItems = [...products];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "price":
            aValue = a.price;
            bValue = b.price;
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig]);

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.warn("Sin stock disponible");
      return;
    }

    addToCart(product, 1);
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

      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Col>

        <Col md={3} className="mb-3 mb-md-0">
          <Dropdown onSelect={handleTypeSelect} className="w-100">
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-filter"
              className="w-100"
            >
              {currentFilterDisplay}{" "}
              {selectedType && (
                <span style={{ float: "right", fontWeight: "bold" }}>×</span>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu
              data-bs-theme="dark"
              className="wine-filter-menu"
              style={{ minWidth: "100%", zIndex: 1050 }}
            >
              {selectedType && (
                <Dropdown.Item
                  className="filter-item"
                  onClick={() => handleTypeSelect("")}
                >
                  Mostrar Todos
                </Dropdown.Item>
              )}
              {productTypes.map((type) => (
                <Dropdown.Item
                  key={type}
                  eventKey={type}
                  active={selectedType === type}
                  className="filter-item"
                >
                  {type}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-sort"
              className="w-100"
            >
              Ordenar por
              <SortIcon fieldKey={sortConfig.key} />{" "}
            </Dropdown.Toggle>

            <Dropdown.Menu
              data-bs-theme="dark"
              className="wine-sort-menu"
              style={{ minWidth: "100%", zIndex: 1050 }}
            >
              <Dropdown.Item
                className="product-sort"
                onClick={() => handleSort("name")}
              >
                Nombre <SortIcon fieldKey="name" />
              </Dropdown.Item>
              <Dropdown.Item
                className="product-sort"
                onClick={() => handleSort("price")}
              >
                Precio <SortIcon fieldKey="price" />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {loading ? (
        <div className="page-center">
          <Spinner animation="border" variant="light" />
          Cargando Listado de Vinos
        </div>
      ) : noProductsFound ? (
        <p className="text-center mt-5">
          No se encontraron productos que coincidan con los criterios.
        </p>
      ) : (
        <ItemList
          items={sortedProducts}
          onAction={handleAddToCart}
          actionText="Agregar al Carrito"
          emptyListMessage="No hay productos disponibles en este momento."
        />
      )}
    </div>
  );
};

export default Products;
