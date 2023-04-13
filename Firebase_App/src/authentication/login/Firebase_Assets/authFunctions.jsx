// src/authFunctions.js
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signInWithEmailAndPassword as signInWithEmail, createUserWithEmailAndPassword  as registerWithEmail} from "firebase/auth";

const providerGoogle = new GoogleAuthProvider();

export const signInWithGoogle = async (auth) => {
  return await signInWithPopup(auth, providerGoogle);
};


export const signInWithEmailAndPassword = async (auth, email, password) => {
  return await signInWithEmail(auth, email, password);
};

export const registerWithEmailAndPassword = async(auth,email,password)=>{
  return await registerWithEmail(auth,email,password);
}