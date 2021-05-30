import firebase from "firebase/app";
import "firebase/auth";

const app = firebase.initializeApp({
  apiKey: "AIzaSyDat5t7WK8ybpLyX7-xCk7Bn8LleEfH3J4",
  authDomain: "football-match-maker.firebaseapp.com",
  projectId: "football-match-maker",
  storageBucket: "football-match-maker.appspot.com",
  messagingSenderId: "1072645854605",
  appId: "1:1072645854605:web:146ff91b0ebe4d4358d9c4",
});

export const auth = app.auth();
export default app;
