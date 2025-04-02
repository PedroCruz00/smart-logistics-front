// Función para obtener los datos desde localStorage
function getStoredData() {
  try {
    const data = localStorage.getItem("products");
    if (data) {
      return JSON.parse(data);
    } else {
      console.info("No hay productos guardados en localStorage");
      return [];
    }
  } catch (error) {
    console.error("Error al obtener datos de localStorage:", error);
    return [];
  }
}

// Exportar la función para usarla en otros componentes
export { getStoredData };
