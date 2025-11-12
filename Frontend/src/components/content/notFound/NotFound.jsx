import { useNavigate } from 'react-router-dom'
import React from 'react'
import { Button } from 'react-bootstrap'
import './NotFound.css'


const NotFound = () => {

    const navigate = useNavigate();

    const goBackLoginHandler = () => {
        navigate('/')
    }


  return (
    <div className="notfound-page">
    <div className="notfound-container">
      <img
        src="src\assets\images\404.png"

        alt="Botella perdida"
        className="notfound-image"
      />
      <h2 className="notfound-title">
        ¡Oops! La página solicitada no fue encontrada
      </h2>
      <Button variant="danger" onClick={goBackLoginHandler}>
        Volver
      </Button>
    </div>
  </div>
);
};

export default NotFound;