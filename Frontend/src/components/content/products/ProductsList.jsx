import React from "react";
import ProductItem from "./ProductsItem";

const ProductsList = ({ products, onBuy }) => {
  if (products.length === 0) {
    return <p>No hay productos disponibles.</p>;
  }

  return (
    <div className="row">
      {products.map((product) => (
        <div key={product.id} className="col-md-4 mb-4">
          <ProductItem product={product} onBuy={onBuy} />
        </div>
      ))}
    </div>
  );
};

export default ProductsList;