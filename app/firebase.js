// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_XYoifixSWnfUjko0ra2pClO5GOLVmHc",
  authDomain: "audio-note-7df48.firebaseapp.com",
  projectId: "audio-note-7df48",
  storageBucket: "audio-note-7df48.appspot.com",
  messagingSenderId: "222574603846",
  appId: "1:222574603846:web:202def6d803f9a7c322447",
  measurementId: "G-DLXCLYWKY9"
};


let app;
if (firebase.apps && firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.initializeApp(firebaseConfig);
}

const auth = getAuth(app);



const firestore = getFirestore(app);

export { auth, firestore };
