import React, { useRef, useState, useEffect } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Companies } from "../constants/enums";
import firebase from "firebase";

const Signup = () => {
  const emailRef = useRef();
  const paswordRef = useRef();
  const nameRef = useRef();
  const lastNameRef = useRef();
  const passwordConfirmRef = useRef();
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const history = useHistory();
  const db = firebase.firestore();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (paswordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }
    try {
      setError("");
      setLoading(true);
      const { user } = await signUp(
        emailRef.current.value,
        paswordRef.current.value
      );
      user.sendEmailVerification();
      createUser(user.uid, {
        name: nameRef.current.value,
        lastName: lastNameRef.current.value,
        id: user.uid,
        secretId: Companies.SOLABORATE,
        email: user.email,
      });
    } catch (err) {
      setError("Failed to create an account");
    }
    setLoading(false);
  };

  const createUser = (id, userDetails) => {
    db.collection("users")
      .doc(id)
      .set(userDetails)
      .then(() => {
        console.log("User created!");
        history.push("/");
      })
      .catch((error) => {
        console.error("User creation error: ", error);
      });
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center margin-bottom-container"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="w-100" style={{ maxWidth: "400px" }}>
          <Card.Body>
            <h2 className="text-center mb-4">Sign Up</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group id="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="name" required ref={nameRef}></Form.Control>
              </Form.Group>
              <Form.Group id="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="lastName"
                  required
                  ref={lastNameRef}
                ></Form.Control>
              </Form.Group>
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
              <Form.Group id="password-confirm">
                <Form.Label>Password Confirmation</Form.Label>
                <Form.Control
                  type="password"
                  required
                  ref={passwordConfirmRef}
                ></Form.Control>
              </Form.Group>
              <Button
                disabled={isLoading}
                className="w-100"
                type="submit"
                onClick={handleSubmit}
              >
                Signup
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </Container>
  );
};

export default Signup;
