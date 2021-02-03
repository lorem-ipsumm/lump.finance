import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyCVrVe-iI3nlSbpyfUVkV3wowBbdN-yJLA",
    authDomain: "lump-finance.firebaseapp.com",
    projectId: "lump-finance",
    storageBucket: "lump-finance.appspot.com",
    messagingSenderId: "154981278760",
    appId: "1:154981278760:web:50b25d30fa8dc9c6e8c11d"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
export default db;