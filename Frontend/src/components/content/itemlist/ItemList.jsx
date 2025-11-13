import { Card, Button, Row, Col } from "react-bootstrap";
import {
  Coin,
  CurrencyDollar,
  PencilSquare,
  TrashFill,
  ArrowClockwise,
} from "react-bootstrap-icons";
import "./ItemList.css";

const ItemList = ({
  items,
  onAction,
  onEdit,
  onDelete,
  isAdmin,
  actionText,
  emptyListMessage,
}) => {
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
          isDeleted,
        } = item;

        const isOutOfStock = stock <= 0;
        const isSoftDeleted = isDeleted === true;

        return (
          <Col key={id} xs={12} sm={6} lg={4} xl={3} className="mb-4">
            <Card
              className={`h-100 text-center shadow item-card ${
                isSoftDeleted ? "deleted-card" : ""
              }`}
            >
              <Card.Img
                variant="top"
                src={imageUrl}
                alt={name}
                style={{ height: "200px", objectFit: "contain" }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>
                  {name}
                  {isSoftDeleted && (
                    <span
                      className="text-danger ms-2"
                      style={{ fontSize: "0.8em" }}
                    >
                      (Eliminado)
                    </span>
                  )}
                </Card.Title>
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

                  {isAdmin ? (
                    <div className="d-flex justify-content-around">
                      <Button
                        variant={isSoftDeleted ? "success" : "primary"}
                        onClick={() => onEdit(item)}
                        className="item-card-button me-2"
                      >
                        {isSoftDeleted ? (
                          <>
                            <ArrowClockwise className="me-1" /> Restaurar
                          </>
                        ) : (
                          <>
                            <PencilSquare className="me-1" /> Editar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => onDelete(item)}
                        className="item-card-button"
                      >
                        <TrashFill className="me-1" /> Eliminar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => onAction(item)}
                      disabled={isOutOfStock || isSoftDeleted}
                      className="item-card-button"
                    >
                      {isOutOfStock || isSoftDeleted ? "Sin Stock" : actionText}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ItemList;
