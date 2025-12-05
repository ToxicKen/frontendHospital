import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./app.css";

export default function Login({ onLogin }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
            <h2>Inicio de Sesión</h2>
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
            />
            <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <button type="submit">Ingresar</button>

            <p style={{ color: "#00000072" }}>
                ¿No tienes cuenta? <a href="/Register">Regístrate aquí</a>
            </p>
        </form>
    );
}
