import React from "react";

const ProductItem = ({ product, onBuy }) => {
  return (
    <div className="card h-100 text-center">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="card-img-top"
        style={{ height: "200px", objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">Tipo: {product.type}</p>
        <p className="card-text">Precio: ${product.price}</p>
        <p className="card-text">Stock: {product.stock}</p>
        <button
          className="btn btn-primary"
          onClick={() => onBuy(product)}
          disabled={product.stock <= 0}
        >
          Comprar
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
