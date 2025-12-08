import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./app.css";

export default function Login({ onLogin }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const Rc = () => navigate("/RegistrarPaciente");
    const Ac = () => navigate("/Actualizar");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError("Por favor, completa todos los campos");
            setLoading(false);
            return;
        }

        try {
            const result = await onLogin(formData.email, formData.password);

            if (result.success) {
                // Redirigir según el rol del usuario
                switch(result.userRole) {
                    case 'DOCTOR':
                        navigate("/TableroDoctor");
                        break;
                    case 'RECEPCIONISTA':
                        navigate("/TableroRecepcionista");
                        break;
                    case 'PACIENTE':
                        navigate("/Home");
                        break;
                    default:
                        navigate("/Home");
                }
            } else {
                setError(result.message || "Email o contraseña incorrectos");
            }
        } catch (err) {
            console.error("Error en login:", err);
            setError("Ocurrió un error, intenta de nuevo");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Estilo solo para inputs de correo y contraseña
    const inputStyle = {
        maxWidth: "300px",
        width: "100%",
        margin: "4px auto",
        display: "block"
    };

    return (
        <form className="inicioS" onSubmit={handleSubmit}>
            <div className="spacer"></div>
            <h1>Inicio de Sesión</h1>
            <hr style={{ borderColor: "#000", backgroundColor: "#000" }} />

            {error && <div className="error-message">{error}</div>}

            <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
                className="estil-cjs"
                style={inputStyle}
                disabled={loading}
            />
            <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                className="estil-cjs"
                style={inputStyle}
                disabled={loading}
            />

            <button
                type="submit"
                className="btn-lng"
                disabled={loading}
            >
                {loading ? "Cargando..." : "Ingresar"}
            </button>

            <div className="spacer"></div>

            <div className="subcontainer">
                <div className="row">
                    <div className="lr-text">¿No tienes cuenta?</div>
                    <div className="lr-text">¿Olvidaste tu contraseña?</div>
                </div>

                <div className="row">
                    <button className="extras-lgn" type="button" onClick={Rc} disabled={loading}>
                        Regístrate aquí
                    </button>
                    <button className="extras-lgn" type="button" onClick={Ac} disabled={loading}>
                        Actualizala aquí
                    </button>
                </div>
            </div>
        </form>
    );
}