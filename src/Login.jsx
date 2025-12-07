import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./app.css";

export default function Login({ onLogin }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const Rc = () => navigate("/Register");
    const Ac = () => navigate("/Actualizar");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Por favor, completa todos los campos");
            return;
        }

        try {
            // Usar la función onLogin que viene de App
            const success = await onLogin(formData.email, formData.password);
            if (success) {
                localStorage.setItem("currentUser", JSON.stringify(userLogged));//Guardar inicio temporalmente
                navigate("/Home"); // Solo navegar si login fue exitoso
            } else {
                setError("Email o contraseña incorrectos");
            }
        } catch (err) {
            console.error("Error en login:", err);
            setError("Ocurrió un error, intenta de nuevo");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <form className="inicioS" onSubmit={handleSubmit}>
      <div className="spacer"></div>
      <h1>Inicio de Sesión</h1>
      <hr style={{ borderColor: "#000", backgroundColor: "#000" }} />

      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
            border: "1px solid red",
          }}
        >
          {error}
        </div>
      )}

      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={formData.email}
        onChange={handleChange}
        required
        className="estil-cjs"
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleChange}
        required
        className="estil-cjs"
        style={{ margin: "4px" }}
      />
      <>
        <button type="submit" className="btn-lng">
          Ingresar
        </button>

        <div className="spacer"></div>

        <div className="subcontainer">
          <div className="row">
            <div className="lr-text">¿No tienes cuenta?</div>
            <div className="lr-text">¿Olvidaste tu contraseña?</div>
          </div>

          <div className="row">
            <button className="extras-lgn" type="button" onClick={Rc}>
              Regístrate aquí
            </button>
            <button className="extras-lgn" type="button" onClick={Ac}>
              Actualizala aquí
            </button>
          </div>
        </div>
      </>
    </form>
  );
}
