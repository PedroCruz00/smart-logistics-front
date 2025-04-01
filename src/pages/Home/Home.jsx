import { useState } from "react";
import InputDD from "../../components/input/InputDD";
import Input from "../../components/input/Input";
import Modal from "../../components/modal/Modal";
import "./Home.css";

function Home() {
  const [selectedOption, setSelectedOption] = useState("Opción 1");
  const [input1, setInput1] = useState(""); // Estado para el primer input
  const [input2, setInput2] = useState(""); // Estado para el segundo input
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <h3>Crear:</h3>

      <label htmlFor="dropdown">Selecciona una opción:</label>
      <InputDD
        options={["Opción 1", "Opción 2", "Opción 3"]}
        value={selectedOption}
        onChange={(value) => setSelectedOption(value)} // Asegura actualización
      />

      <label htmlFor="input1">Escribe algo:</label>
      <Input
        className="input"
        id="input1"
        value={input1}
        onChange={(e) => setInput1(e.target.value)}
      />

      <label htmlFor="input2">Escribe algo más:</label>
      <Input
        className="input"
        id="input2"
        value={input2}
        onChange={(e) => setInput2(e.target.value)}
      />

      <Modal
        title="New Store"
        content="Do you want to create a new store?"
        buttonLabel="Create"
      />
    </>
  );
}

export default Home;
