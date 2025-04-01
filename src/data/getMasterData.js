// Función para obtener los datos desde localStorage
function getStoredData() {
  const data = localStorage.getItem("products");
  if (data) {
    return JSON.parse(data);
  } else {
    console.log("No se encontraron datos en localStorage");
    return [];
  }
}

// Ejemplo de cómo puedes acceder a los datos
const products = getStoredData();
console.log("Productos desde localStorage:", products);
