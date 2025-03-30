import Modal from "../components/modal/Modal";
import Input from "../components/input/Input";
import "./Settings.css";

function Settings() {
  return (
    <div className="form-settings">
      <div>
        <label className="label" htmlFor="stock">
          Stock (%){" "}
        </label>
        <Input className="input" id="stock" />
      </div>
      <div>
        <label className="label" htmlFor="nearby">
          Nearby(meters)
        </label>
        <Input className="input" id="nearby" />
      </div>
      <Modal
        title="Update settings"
        content="Are you sure?
        It will change the configurations to create new stores"
        buttonLabel="Update"
      />
    </div>
  );
}
export default Settings;
