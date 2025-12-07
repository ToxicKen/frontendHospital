import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./app.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const navigate = useNavigate();

  const handleReset = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const index = users.findIndex((u) => u.correoElectronico === email);

    if (index === -1) {
      alert("Usuario no encontrado");
      return;
    }

    users[index].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Contraseña actualizada");
    navigate("/");
  };

  const ret = () => navigate("/");

  return (
    <div className="reset-container">
      <div className="reset-card">
        <button className="resetbtn" onClick={ret}>
          ×
        </button>
        <h2>Recuperar Contraseña</h2>

        <input
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Nueva contraseña"
          type="password"
          onChange={(e) => setNewPass(e.target.value)}
        />

        <button onClick={handleReset}>Actualizar</button>
      </div>
    </div>
  );
}
