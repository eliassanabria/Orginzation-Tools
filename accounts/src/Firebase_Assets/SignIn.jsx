// src/SignIn.js
import React from "react";
import { auth } from "./firebaseConfig";
import {
  signInWithGoogle,
  signInWithEmailAndPassword,
} from "./authFunctions";

const SignIn = () => {
  const signInHandler = async (signInFunction) => {
    try {
      await signInFunction(auth);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => signInHandler(signInWithGoogle)}>Sign in with Google</button>
      
      
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button onClick={() => signInHandler(() => signInWithEmailAndPassword(auth))}>Sign in with Email/Password</button>
      </form>
    </div>
  );
};

export default SignIn;
 