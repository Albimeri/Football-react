import React, { useRef, useState, useEffect } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Companies } from "../constants/enums";

const Login = () => {
  const emailRef = useRef();
  const paswordRef = useRef();
  const secretIdRef = useRef();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // if (!Object.values(Companies).includes(secretIdRef.current.value)) {
    //   setError("Secret Id is invalid. Please contact Admin for more info!");
    //   return;
    // } 
    try {
      setError("");
      setLoading(true);
      const { additionalUserInfo, user, operationType, credential } =
        await login(emailRef.current.value, paswordRef.current.value);

      history.push("/");
    } catch (err) {
      setError("Failed to log in");
    }
    setLoading(false);
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center "
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              {/* <Form.Group id="secretId">
                <Form.Label>Secret Id</Form.Label>
                <Form.Control
                  type="password"
                  required
                  ref={secretIdRef}
                ></Form.Control>
              </Form.Group> */}
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  ref={emailRef}
                ></Form.Control>
              </Form.Group>

              <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  ref={paswordRef}
                ></Form.Control>
              </Form.Group>

              <Button
                disabled={isLoading}
                className="w-100"
                type="submit"
                onClick={handleSubmit}
              >
                Login
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-3">
          <Link to="/forgot-password">Forgot Password</Link>
        </div>
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/signup">Signup</Link>
        </div>
      </div>
    </Container>
  );
};

export default Login;
