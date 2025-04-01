// Importar los métodos necesarios de Firebase
import { initializeApp } from "firebase/app"; // Corregido: importar desde firebase/app

// Tu configuración de Firebase
// NOTA: Deberías reemplazar estos valores con los de tu proyecto real de Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "tu-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tu-proyecto-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tu-proyecto.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "tu-messaging-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

export default app;