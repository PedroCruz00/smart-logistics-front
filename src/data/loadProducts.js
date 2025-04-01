// Función para cargar los datos de la API con el token y guardarlos en localStorage
async function fetchAndStoreData() {
    const token = localStorage.getItem('authToken'); // Recuperamos el token del localStorage (ajustar si lo guardas en otro lugar)
  
    if (!token) {
      console.error('Token no disponible');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/master-data/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Incluimos el token en los encabezados
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('No se pudo obtener los datos');
      }
  
      const data = await response.json();
  
      // Guardar los datos obtenidos en localStorage
      localStorage.setItem('products', JSON.stringify(data));
  
      console.log('Datos cargados y guardados en localStorage:', data);
  
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }
  
  // Cargar los datos al iniciar la aplicación
  fetchAndStoreData();
  