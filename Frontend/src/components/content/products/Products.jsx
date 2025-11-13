import React, { useState, useEffect } from "react";
import ItemList from "../itemlist/ItemList";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("products-background");
    return () => {
      document.body.classList.remove("products-background");
    };
  }, []);

  useEffect(() => {
    fetch(
      "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/product"
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudieron cargar los productos");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        toast.error("Error al cargar los productos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.warn("Sin stock disponible");
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    toast.success(`${product.name} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className="page-center">
        <Spinner animation="border" variant="light" />
        Cargando Listado de Vinos
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ color: "white" }}>
      <h3 className="mb-3 text-center">Productos Disponibles</h3>
      <ItemList
        items={products}
        onAction={handleAddToCart}
        actionText="Agregar al Carrito"
        emptyListMessage="No hay productos disponibles en este momento."
      />
    </div>
  );
};

export default Products;
