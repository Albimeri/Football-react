import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const signUp = async (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
  };

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => await auth.signOut();

  const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email);
  };

  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((user) => { 
      setCurrentUser(user);
      setIsLoading(false);
    });
    return unSubscribe;
  }, []);

  const value = { currentUser, signUp, login, logout, resetPassword };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
