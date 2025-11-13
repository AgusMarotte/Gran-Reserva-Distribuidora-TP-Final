import { Navigate } from "react-router";
import { Spinner } from "react-bootstrap";
import "../public/Public.css";

const Public = ({ isSignedIn, isLoading, children }) => {
  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default Public;
