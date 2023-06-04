// src/authFunctions.js
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword as signInWithEmail } from "firebase/auth";

const providerGoogle = new GoogleAuthProvider();

export const signInWithGoogle = async (auth) => {
  return await signInWithPopup(auth, providerGoogle);
};


export const signInWithEmailAndPassword = async (auth, email, password) => {
  return await signInWithEmail(auth, email, password);
};
