import { useState, useEffect } from "react";
import { useUser } from "../../services/UserContext"; // Ajusta la ruta según tu estructura de carpetas
import Modal from "../../components/modal/Modal";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import "./Settings.css";

function Settings() {
  const { user, loading: userLoading } = useUser();
  const [settings, setSettings] = useState({ percentage: "", minDistance: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Efecto para cargar la configuración cuando el usuario esté disponible
  useEffect(() => {
    if (userLoading) return; // Esperar a que termine la carga del contexto de usuario

    if (!backendUrl) {
      setError("Backend URL is not set");
      setLoading(false);
      return;
    }

    if (!user) {
      setError(
        "Usuario no autenticado. Por favor inicia sesión para continuar."
      );
      setLoading(false);
      return;
    }

    fetchSettings();
  }, [backendUrl, user, userLoading]);

  // Función para obtener la configuración actual
  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Obtener el token de localStorage (en lugar de esperar a Firebase)
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación disponible");
      }

      console.log("🔑 Usando token almacenado para fetchSettings");

      const response = await fetch(`${backendUrl}/api/master-data/config`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al obtener configuración (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      console.log("📊 Datos de configuración recibidos:", data);

      setSettings({
        percentage: data.percentage !== undefined ? data.percentage : "",
        minDistance: data.minDistance !== undefined ? data.minDistance : "",
      });

      setError(null);
    } catch (err) {
      console.error("❌ Error al obtener configuración:", err);
      setError(`Error al cargar la configuración: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la configuración
  const updateSettings = async () => {
    if (!user) {
      setError("Usuario no autenticado");
      return false; // Retorna false para que Modal sepa que falló
    }

    try {
      // Obtener el token de localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación disponible");
      }

      console.log("🔑 Usando token almacenado para updateSettings");
      console.log("📝 Actualizando configuración:", settings);

      // Validación de datos antes de enviar
      if (settings.percentage === "" || isNaN(Number(settings.percentage))) {
        throw new Error("El porcentaje debe ser un número válido");
      }

      if (settings.minDistance === "" || isNaN(Number(settings.minDistance))) {
        throw new Error("La distancia mínima debe ser un número válido");
      }

      // Realizar ambas actualizaciones en paralelo
      const [percentageResponse, minDistanceResponse] = await Promise.all([
        fetch(
          `${backendUrl}/api/master-data/config/percentage?percentage=${settings.percentage}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        ),
        fetch(
          `${backendUrl}/api/master-data/config/min-distance?minDistance=${settings.minDistance}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        ),
      ]);

      // Verificar respuestas individualmente
      if (!percentageResponse.ok) {
        const errorText = await percentageResponse.text();
        throw new Error(
          `Error al actualizar porcentaje (${percentageResponse.status}): ${errorText}`
        );
      }

      if (!minDistanceResponse.ok) {
        const errorText = await minDistanceResponse.text();
        throw new Error(
          `Error al actualizar distancia mínima (${minDistanceResponse.status}): ${errorText}`
        );
      }

      // Mostrar mensaje de éxito
      setSuccessMessage("Configuración actualizada correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Recargar los datos para asegurar que vemos los valores actualizados
      await fetchSettings();

      return true; // Retorna true para que Modal sepa que fue exitoso
    } catch (err) {
      console.error("❌ Error al actualizar configuración:", err);
      setError(`Error al actualizar configuración: ${err.message}`);
      return false; // Retorna false para que Modal sepa que falló
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchSettings();
  };

  const renderModalContent = () => (
    <div className="settings-form">
      <p>
        ¿Está seguro que desea actualizar la configuración con los siguientes
        valores?
      </p>
      <div className="settings-summary">
        <div className="setting-item">
          <span className="setting-label">Porcentaje:</span>
          <span className="setting-value">{settings.percentage}%</span>
        </div>
        <div className="setting-item">
          <span className="setting-label">Distancia mínima:</span>
          <span className="setting-value">{settings.minDistance} metros</span>
        </div>
      </div>
    </div>
  );

  // Si el usuario aún se está cargando, mostramos un spinner
  if (userLoading) {
    return (
      <div className="settings-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Configuración</h2>
        {successMessage && (
          <div className="success-message">
            <span>✓</span> {successMessage}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando configuración...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">
            <span>⚠️</span> {error}
          </p>
          <Button onClick={handleRetry}>Reintentar</Button>
        </div>
      ) : (
        <div className="settings-form-container">
          <div className="settings-form">
            <Input
              label="Porcentaje"
              value={settings.percentage}
              onChange={(e) =>
                setSettings({ ...settings, percentage: e.target.value })
              }
              icon="percent"
              placeholder="Introduce el porcentaje"
              type="number"
            />
            <Input
              label="Distancia mínima"
              value={settings.minDistance}
              onChange={(e) =>
                setSettings({ ...settings, minDistance: e.target.value })
              }
              icon="ruler"
              placeholder="Introduce la distancia mínima"
              type="number"
              unit="m"
            />

            <div className="settings-actions">
              <Modal
                title="Confirmar actualización"
                content={renderModalContent()}
                buttonLabel="Guardar cambios"
                onConfirm={updateSettings}
                triggerButton={
                  <Button className="primary-button">Guardar cambios</Button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
