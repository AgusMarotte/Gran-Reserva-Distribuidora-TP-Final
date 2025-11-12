import { Navigate } from "react-router";
import { Spinner } from "react-bootstrap";
import "./Protected.css";

const Protected = ({ isSignedIn, isLoading, children }) => {
  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
