import { createContext, useState, useEffect, useContext } from "react";
import { Button, Modal, ListGroup, Row, Col, Form } from "react-bootstrap";
import { TrashFill, CurrencyDollar } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const CartContext = createContext();
const CART_STORAGE_KEY = "shoppingCart";
const API_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Order";

const loadCartFromStorage = () => {
  try {
    const serializedCart = localStorage.getItem(CART_STORAGE_KEY);
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (error) {
    console.error("Error al cargar el carrito desde localStorage:", error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    const serializedCart = JSON.stringify(cart);
    localStorage.setItem(CART_STORAGE_KEY, serializedCart);
  } catch (error) {
    console.error("Error al guardar el carrito en localStorage:", error);
  }
};

const formatPrice = (price) =>
  price?.toLocaleString("es-AR", { minimumFractionDigits: 2 });

export const useCart = () => useContext(CartContext);

const Cart = ({ children, onPointsUpdate }) => {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (product, amount = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        const theoreticalMax = currentItem.maxStock;

        if (currentItem.amount + amount > theoreticalMax) {
          toast.warn(
            `Solo quedan ${
              theoreticalMax - currentItem.amount
            } unidades disponibles para agregar de ${product.name}.`
          );
          return prevItems;
        }

        updatedItems[existingItemIndex] = {
          ...currentItem,
          amount: currentItem.amount + amount,
        };
        toast.success(`${amount}x ${product.name} agregado/s al carrito.`);
        return updatedItems;
      } else {
        const maxAvailableStock = product.stock;
        if (amount > maxAvailableStock) {
          toast.warn(
            `No hay stock suficiente para agregar ${amount} unidades de ${product.name}. Stock: ${maxAvailableStock}`
          );
          return prevItems;
        }

        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          amount: amount,
          maxStock: product.stock,
        };
        toast.success(`${amount}x ${product.name} agregado/s al carrito.`);
        return [...prevItems, newItem];
      }
    });
  };

  const updateItemAmount = (itemId, newAmount) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return prevItems;

      if (newAmount <= 0) {
        toast.info(`${prevItems[itemIndex].name} removido del carrito.`);
        return prevItems.filter((item) => item.id !== itemId);
      }

      const itemToUpdate = prevItems[itemIndex];

      if (newAmount > itemToUpdate.maxStock) {
        toast.warn(
          `Solo puedes comprar hasta ${itemToUpdate.maxStock} unidades de ${itemToUpdate.name}.`
        );
        return prevItems;
      }

      const updatedItems = [...prevItems];
      updatedItems[itemIndex] = { ...itemToUpdate, amount: newAmount };
      return updatedItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((item) => item.id === productId);
      if (item) {
        toast.info(`${item.name} removido del carrito.`);
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    // toast.info("El carrito ha sido vaciado."); <-- Notificación eliminada
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.amount,
    0
  );
  const totalItemsCount = cartItems.reduce(
    (total, item) => total + item.amount,
    0
  );

  const handleCloseModal = () => setIsCartOpen(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isProcessing) {
      if (cartItems.length === 0) toast.warn("El carrito está vacío.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Debes iniciar sesión para completar la compra.");
      return;
    }

    setIsProcessing(true);

    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      amount: item.amount,
    }));

    const payload = {
      items: orderItems,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = "Error al procesar la orden.";
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (jsonError) {
          if (responseText && responseText.length < 150)
            errorMsg = responseText;
        }
        throw new Error(errorMsg);
      } else {
        let newOrder;
        try {
          newOrder = JSON.parse(responseText);
        } catch (e) {
          console.error("Respuesta de orden no es JSON válido:", responseText);
        }

        if (
          newOrder &&
          newOrder.clientCurrentPoints !== undefined &&
          typeof onPointsUpdate === "function"
        ) {
          onPointsUpdate(newOrder.clientCurrentPoints);
          toast.success(
            `Orden #${newOrder.id} creada con éxito! Ganaste ${newOrder.pointsEarned} puntos.`
          );
        } else {
          toast.success("¡Orden creada con éxito!");
        }

        clearCart();
        handleCloseModal();
        navigate("/my-orders");
      }
    } catch (error) {
      console.error("Error en el checkout:", error);
      toast.error(error.message || "Error al comunicarse con el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateItemAmount,
    totalAmount,
    totalItemsCount,
    isCartOpen,
    setIsCartOpen,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}

      <Modal
        show={isCartOpen}
        onHide={handleCloseModal}
        centered
        data-bs-theme="dark"
        style={{ zIndex: 1060 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Tu Carrito de Compras</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.length === 0 ? (
            <div className="text-center">
              <p>El carrito está vacío. ¡Agregá algunos productos!</p>
              <Button
                as={Link}
                to="/products"
                variant="danger"
                onClick={handleCloseModal}
              >
                Ver Productos
              </Button>
            </div>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className="bg-transparent text-white px-0 border-secondary"
                >
                  <Row className="align-items-center">
                    <Col xs={2}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "auto",
                          maxWidth: "50px",
                        }}
                      />
                    </Col>
                    <Col xs={5}>
                      <strong className="d-block text-truncate">
                        {item.name}
                      </strong>
                      <small className="text-secondary d-block">
                        ${formatPrice(item.price)} c/u
                      </small>
                    </Col>
                    <Col
                      xs={2}
                      className="d-flex align-items-center justify-content-end p-0"
                    >
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.amount}
                        onChange={(e) => {
                          const newAmount = Number(e.target.value);
                          if (!isNaN(newAmount) && newAmount >= 1) {
                            updateItemAmount(item.id, newAmount);
                          } else if (newAmount < 1) {
                            updateItemAmount(item.id, 0);
                          }
                        }}
                        style={{ maxWidth: "60px", display: "inline" }}
                        className="bg-dark text-white border-secondary text-center"
                        max={item.maxStock}
                      />
                    </Col>
                    <Col xs={3} className="text-end ps-1">
                      <strong className="d-block">
                        ${formatPrice(item.price * item.amount)}
                      </strong>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="mt-1 p-0 px-1"
                      >
                        <TrashFill />
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {cartItems.length > 0 && (
            <>
              <hr className="my-3" />
              <div className="d-flex justify-content-between align-items-center mt-3">
                <h5>Total:</h5>
                <h4 className="fw-bold d-flex align-items-center">
                  <CurrencyDollar />
                  {formatPrice(totalAmount)}
                </h4>
              </div>
            </>
          )}
        </Modal.Body>
        {cartItems.length > 0 && (
          <Modal.Footer className="justify-content-between">
            <Button
              variant="outline-secondary"
              onClick={clearCart}
              disabled={isProcessing}
            >
              Vaciar Carrito
            </Button>
            <Button
              variant="danger"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isProcessing}
            >
              {isProcessing ? "Procesando..." : "Finalizar Compra"}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </CartContext.Provider>
  );
};

export default Cart;
