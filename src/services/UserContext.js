import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import firebaseApp from "./firebase";

// Crear el contexto
const UserContext = createContext();

// Hook para usar el contexto más fácilmente
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp);

  // Verificar si hay un token en localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Si hay un usuario autenticado, guardamos su información
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || "Usuario",
          role: currentUser.role || "user",
        };
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else if (!localStorage.getItem('authToken')) {
        // Solo eliminar el usuario si no hay token en localStorage
        setUser(null);
        localStorage.removeItem('userData');
      }
      setLoading(false);
    });

    // Limpieza cuando el componente se desmonte
    return () => unsubscribe();
  }, [auth]);

  const logoutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Nueva función para establecer el usuario desde el token recibido de la API
  const setUserFromToken = (authData) => {
    if (authData && authData.idToken) {
      const userData = {
        uid: authData.localId,
        email: authData.email,
        displayName: authData.displayName || "Usuario",
        role: "user", // Puedes extraerlo de un claim personalizado si lo tienes
      };
      
      // Guardar el token y los datos de usuario en localStorage
      localStorage.setItem('authToken', authData.idToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Actualizar el estado
      setUser(userData);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, logoutUser, setUserFromToken }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
