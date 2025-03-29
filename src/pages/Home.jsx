import { useState } from "react";
import InputDD from "../components/input/InputDD";
import Input from "../components/input/Input";

function Home() {
  const [selectedOption, setSelectedOption] = useState("");

  const handleDropdownChange = (option) => {
    setSelectedOption(option);
    console.log("Opción seleccionada:", option);
  };

  return (
    <div className="container mt-5">
      <h2>Selecciona una opción:</h2>
      <InputDD
        options={["Opción 1", "Opción 2", "Opción 3"]}
        value={selectedOption}
        onChange={handleDropdownChange}
      />
      <Input />
    </div>
  );
}

export default Home;
