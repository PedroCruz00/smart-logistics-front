import { createContext, useContext, useState } from "react";

// Crear el contexto
const UserContext = createContext();

// Hook para usar el contexto más fácilmente
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "Juan Pérez", // Nombre de prueba
    role: "superadmin", // Puede ser "admin" o "superadmin"
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
export default UserProvider;
