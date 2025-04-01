import { useState, useEffect } from "react";
import { fetchSettings } from "../../api/settingsApi";
import Modal from "../../components/modal/Modal";
import Input from "../../components/input/Input";
import "./Settings.css";

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data); // Guardamos los datos directamente
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) return <p>Cargando configuración...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!settings) return <p>No se pudieron cargar los datos.</p>;

  return (
    <div className="form-settings">
      <div>
        <label className="label" htmlFor="stock">
          Stock (%)
        </label>
        <Input
          className="input"
          id="stock"
          value={settings.percentage || ""} // Se asegura de que el input no esté vacío
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
      />
    </div>
  );
}

export default Settings;
