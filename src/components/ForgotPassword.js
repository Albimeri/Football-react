import React, { useRef, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const emailRef = useRef();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to reset passowrd");
    }
    setLoading(false);
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Password Reset</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <div className="container">
            <Form>
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  ref={emailRef}
                ></Form.Control>
              </Form.Group>
              <Button
                disabled={isLoading}
                className="w-100"
                type="submit"
                onClick={handleSubmit}
              >
                Reset Password
              </Button>
            </Form>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-3">
        <Link to="/login">Login</Link>
      </div>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Signup</Link>
      </div>
    </>
  );
};

export default ForgotPassword;
