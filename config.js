import *as firebase from 'firebase'
require("@firebase/firestore")
   firebase.initializeApp( {
    apiKey: "AIzaSyD7z9V41LhYWb9XpgUFvjDTKpkiN0xMuYQ",
    authDomain: "willybook-app.firebaseapp.com",
    projectId: "willybook-app",
    storageBucket: "willybook-app.appspot.com",
    messagingSenderId: "322998796738",
    appId: "1:322998796738:web:25507e7cf49516052c965b"
  });
  // Initialize Firebase
 

export default firebase.firestore()