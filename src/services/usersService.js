import API_URL from "./api";

export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    if (!response.ok) throw new Error("Error obteniendo usuarios");
    return await response.json();
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return [];
  }
};
