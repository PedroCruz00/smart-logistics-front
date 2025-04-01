import { useState, useEffect } from "react";
import Modal from "../../components/modal/Modal";
import Input from "../../components/input/Input";
import "./Settings.css";

function Settings() {
  const [settings, setSettings] = useState({ percentage: "", minDistance: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!backendUrl) {
      console.error(
        "❌ ERROR: La variable de entorno REACT_APP_BACKEND_URL no está definida."
      );
      setError("Backend URL is not set");
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/master-data/config`);
        if (!response.ok)
          throw new Error(`Error fetching settings: ${response.status}`);
        const data = await response.json();
        setSettings({
          percentage: data.percentage ?? "",
          minDistance: data.minDistance ?? "",
        });
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [backendUrl]);

  // Función para actualizar datos en el backend
  const updateSettings = async () => {
    try {
      const responses = await Promise.all([
        fetch(
          `${backendUrl}/api/master-data/config/percentage?percentage=${settings.percentage}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        ),
        fetch(
          `${backendUrl}/api/master-data/config/min-distance?minDistance=${settings.minDistance}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        ),
      ]);

      if (!responses.every((res) => res.ok)) {
        throw new Error("Error al actualizar la configuración");
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      setError(err.message);
    }
  };

  if (loading) return <p>Cargando configuración...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="form-settings">
      <h1>Settings</h1>
      <div>
        <label className="label" htmlFor="stock">
          Stock (%)
        </label>
        <Input
          className="input"
          id="stock"
          value={settings.percentage}
          onChange={(e) =>
            setSettings({ ...settings, percentage: e.target.value })
          }
        />
      </div>

      <div>
        <label className="label" htmlFor="nearby">
          Nearby (meters)
        </label>
        <Input
          className="input"
          id="nearby"
          value={settings.minDistance}
          onChange={(e) =>
            setSettings({ ...settings, minDistance: e.target.value })
          }
        />
      </div>

      <Modal
        title="Update settings"
        content="Are you sure? It will change the configurations to create new stores"
        buttonLabel="Update"
        onConfirm={updateSettings}
      />
    </div>
  );
}

export default Settings;
