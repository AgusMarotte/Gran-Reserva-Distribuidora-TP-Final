import { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import UpdateProfileForm from "./UpdateProfileForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import DeleteAccountSection from "./DeleteAccountSection";
import "./Settings.css";

const Settings = ({ onLogin }) => {
  return (
    <Container className="mt-5 form-container">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="form p-4">
            <Card.Title as="h2" className="form-title mb-4">
              Configuración de Cuenta
            </Card.Title>

            <Row>
              <Col md={6}>
                <UpdateProfileForm />
              </Col>

              <Col md={6}>
                <UpdatePasswordForm onLogin={onLogin} />
              </Col>
            </Row>

            <DeleteAccountSection onLogin={onLogin} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
