
import firebase from "firebase/app";
import "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../../addons_React/firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };