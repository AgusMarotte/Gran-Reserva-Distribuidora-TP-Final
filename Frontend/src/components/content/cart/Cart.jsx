import { Button, Modal, ListGroup, Row, Col, Form } from "react-bootstrap";
import { TrashFill, CurrencyDollar } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const formatPrice = (price) =>
  price?.toLocaleString("es-AR", { minimumFractionDigits: 2 });

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    updateItemAmount,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
    isProcessing,
    handleCheckout,
  } = useCart();

  const handleCloseModal = () => setIsCartOpen(false);

  return (
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
  );
};

export default Cart;
