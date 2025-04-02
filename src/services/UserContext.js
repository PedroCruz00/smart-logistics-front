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

  const fetchUserRole = async (idToken) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/getRoles`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener roles del usuario");
      }

      const data = await response.json();
      return data[0]?.name || "user"; // Extrae el rol o asigna "user" por defecto
    } catch (error) {
      console.error("⚠️ Error obteniendo el rol del usuario:", error);
      return "user"; // En caso de error, se asigna "user" por defecto
    }
  };

  // Escuchar cambios de autenticación en Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          localStorage.setItem("authToken", idToken);

          const role = await fetchUserRole(idToken); // ¡Aquí usamos await!

          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "Usuario",
            role: role, // Ahora sí es el valor correcto
          };

          localStorage.setItem("userData", JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error("⚠️ Error obteniendo datos del usuario:", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }

      setLoading(false);
    });

    return () => unsubscribe();
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
  const setUserFromToken = async (authData) => {
    if (authData && authData.idToken) {
      try {
        const role = await fetchUserRole(authData.idToken); // Asegurar que se espera el resultado de la función

        const userData = {
          uid: authData.localId,
          email: authData.email,
          displayName: authData.displayName || "Usuario",
          role: role, // Ahora sí tiene el valor correcto
        };

        // Guardar en localStorage
        localStorage.setItem("authToken", authData.idToken);
        localStorage.setItem("userData", JSON.stringify(userData));

        // Actualizar el estado global
        setUser(userData);
      } catch (error) {
        console.error("⚠️ Error estableciendo usuario desde el token:", error);
      }
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
