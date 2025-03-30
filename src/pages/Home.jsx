import { useState } from "react";
import InputDD from "../components/input/InputDD";
import Input from "../components/input/Input";
import Modal from "../components/modal/Modal";
import "./Settings.css";

function Home() {
  const [selectedOption, setSelectedOption] = useState("Opción 1"); // Estado para la selección
  const [modalOpen, setModalOpen] = useState(false); // Estado del modal

  return (
    <>
      <h3>Crear:</h3>

      <label htmlFor="dropdown">Selecciona una opción:</label>
      <InputDD
        options={["Opción 1", "Opción 2", "Opción 3"]}
        value={selectedOption}
        onChange={setSelectedOption} // Manejar el cambio de estado
      />

      <label htmlFor="input1">Escribe algo:</label>
      <Input className="input" id="input1" />

      <label htmlFor="input2">Escribe algo más:</label>
      <Input className="input" id="input2" />
      <Modal
        title="New Store"
        content="Do you want to create a new store?"
        buttonLabel="Create"
      />
    </>
  );
}

export default Home;
