import { Card, Button, Row, Col } from "react-bootstrap";
import { Coin, CurrencyDollar } from "react-bootstrap-icons";
import "./ItemList.css";

const ItemList = ({ items, onAction, actionText, emptyListMessage }) => {
  if (!items || items.length === 0) {
    return <p>{emptyListMessage || "No hay items disponibles."}</p>;
  }

  return (
    <Row>
      {items.map((item) => {
        const {
          id,
          name,
          imageUrl,
          stock,
          price,
          type,
          description,
          pointsRequired,
        } = item;

        const isOutOfStock = stock <= 0;

        return (
          <Col key={id} xs={12} sm={6} lg={4} xl={3} className="mb-4">
            <Card className="h-100 text-center shadow card">
              <Card.Img
                variant="top"
                src={imageUrl}
                alt={name}
                style={{ height: "200px", objectFit: "contain" }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{name}</Card.Title>
                <div className="mt-auto">
                  {description && <Card.Text>{description}</Card.Text>}
                  {type && <Card.Text>Tipo: {type}</Card.Text>}

                  {price !== undefined && (
                    <Card.Text className="d-flex justify-content-center align-items-center">
                      <b>Precio:</b> <CurrencyDollar />
                      {price}
                    </Card.Text>
                  )}
                  {pointsRequired !== undefined && (
                    <Card.Text className="d-flex justify-content-center align-items-center">
                      <b>Puntos:</b> <Coin className="mx-1" /> {pointsRequired}
                    </Card.Text>
                  )}

                  <Card.Text>
                    <b>Stock:</b> {stock}
                  </Card.Text>

                  <Button
                    variant={actionText === "Canjear" ? "danger" : "primary"}
                    onClick={() => onAction(item)}
                    disabled={isOutOfStock}
                    className="card-button"
                  >
                    {isOutOfStock ? "Sin Stock" : actionText}
                  </Button>
                </div>{" "}
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ItemList;
