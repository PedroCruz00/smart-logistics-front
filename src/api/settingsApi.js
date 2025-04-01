const backendUrl = process.env.REACT_APP_BACKEND_URL;

export async function fetchSettings() {
  if (!backendUrl) {
    console.error(
      "ERROR: La variable de entorno REACT_APP_BACKEND_URL no está definida."
    );
    throw new Error("Backend URL is not set");
  }

  try {
    const response = await fetch(`${backendUrl}/api/master-data/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("✅ Datos recibidos:", data); // <-- Verifica qué llega del backend
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
