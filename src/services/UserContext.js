import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import firebaseApp from "./firebase";

// Crear el contexto
const UserContext = createContext();

// Hook para usar el contexto fácilmente
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp);

  // Verificar si hay un token en localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("❌ Error al leer userData:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }

    setLoading(false);
  }, []);

  // Escuchar cambios de autenticación en Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();

          // Construir el usuario actualizado
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "Usuario",
            role: "user", // Aquí puedes agregar claims personalizados si los usas
          };

          // Guardar el token y usuario en localStorage
          localStorage.setItem("authToken", idToken);
          localStorage.setItem("userData", JSON.stringify(userData));

          setUser(userData);
        } catch (error) {
          console.error("⚠️ Error obteniendo token de Firebase:", error);
        }
      } else {
        // Si el usuario se desautentica, limpiar datos
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Limpiar suscripción
  }, [auth]);

  // Cerrar sesión
  const logoutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  // Establecer usuario desde el token de la API (cuando inicias sesión con un backend)
  const setUserFromToken = (authData) => {
    if (authData && authData.idToken) {
      const userData = {
        uid: authData.localId,
        email: authData.email,
        displayName: authData.displayName || "Usuario",
        role: "user", // Extraer de claims personalizados si aplica
      };

      // Guardar en localStorage
      localStorage.setItem("authToken", authData.idToken);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Actualizar el estado global
      setUser(userData);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, logoutUser, setUserFromToken }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
