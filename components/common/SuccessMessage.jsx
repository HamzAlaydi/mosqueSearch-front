import React from "react";

const SuccessMessage = ({
  message,
  onRedirect,
  buttonText = "Return Home",
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="success-message">
          <div className="success-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>Verify Your Email</h3>
          <p>{message}</p>
          <button className="auth-button mt-6" onClick={onRedirect}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
