import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import firebaseApp from "./firebase"; // Importamos la configuración de Firebase

// Crear el contexto
const UserContext = createContext();

// Hook para usar el contexto más fácilmente
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp); // Pasamos la instancia de Firebase al getAuth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Si hay un usuario autenticado, guardamos su información
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || "Usuario",
          role: currentUser.role || "user", // Puedes guardar el rol en claims de Firebase
        });
      } else {
        setUser(null);
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
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
