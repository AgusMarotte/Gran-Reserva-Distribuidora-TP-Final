import React, { useState, useEffect } from "react";
import ProductsList from "./ProductsList";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/product")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleBuy = (product) => {
    if (product.stock <= 0) {
      alert("Sin stock disponible");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Productos Disponibles</h3>
      <ProductsList products={products} onBuy={handleBuy} />
    </div>
  );
};

export default Products;



