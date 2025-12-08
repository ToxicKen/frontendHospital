import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import api from "./axios.js";

// --- Importación de Componentes ---
import Login from "./Login.jsx";
import RegistrarPaciente from "./RegistrarPaciente.jsx";
import ForgotPassword from "./Actualizar.jsx";
import ConsultaMedica from './ConsultaMedica.jsx';

// Componentes de Paciente
import Home from "./Home.jsx";
import Agendas from "./Agendas.jsx";
import PatientProfile from "./PatientProfile.jsx";
import MedicalHistory from "./MedicalHistory.jsx";
import Medicines from "./Medicines.jsx";
import EditProfile from "./EditProfile.jsx";

// Componentes de otros Roles
import TableroDoctor from "./TableroDoctor.jsx";
import TableroRecepcionista from "./TableroRecepcionista.jsx";

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const roles = decoded.roles || [];
                let userRole = 'PACIENTE';
                if (roles.includes("ROLE_DOCTOR")) userRole = 'DOCTOR';
                else if (roles.includes("ROLE_RECEPCIONISTA")) userRole = 'RECEPCIONISTA';

                const user = {
                    id: decoded.id || decoded.sub,
                    email: decoded.email || decoded.sub,
                    name: decoded.name || "",
                    role: userRole
                };

                setCurrentUser(user);
                setIsAuthenticated(true);

            } catch (err) {
                console.error("Token inválido al iniciar:", err);
                clearSession();
            }
        }
        setLoading(false);
    }, []);

    const clearSession = () => {
        localStorage.removeItem("token");
        sessionStorage.clear();
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const handleLogin = async (email, password) => {
        try {
            const res = await api.post("/api/auth/login", { correoElectronico: email, contrasenia: password });
            const token = res.data.token;
            if (!token) return { success: false, message: "No se recibió token" };

            localStorage.setItem("token", token);
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            let userRole = 'PACIENTE';
            if (roles.includes("ROLE_DOCTOR")) userRole = 'DOCTOR';
            else if (roles.includes("ROLE_RECEPCIONISTA")) userRole = 'RECEPCIONISTA';

            const user = {
                id: decoded.id || decoded.sub,
                email: decoded.email || decoded.sub,
                name: decoded.name || "",
                role: userRole
            };

            setCurrentUser(user);
            setIsAuthenticated(true);

            return {
                success: true,
                userRole: userRole
            };

        } catch (err) {
            console.error("Error en login:", err);
            return {
                success: false,
                message: err.response?.data?.message || "Error de autenticación"
            };
        }
    };

    // Función para determinar a dónde redirigir según el rol
    const getDashboardByRole = (role) => {
        switch(role) {
            case 'DOCTOR':
                return "/TableroDoctor";
            case 'RECEPCIONISTA':
                return "/TableroRecepcionista";
            case 'PACIENTE':
                return "/Home";
            default:
                return "/";
        }
    };

    if (loading) return <div>Cargando sistema...</div>;

    return (
        <BrowserRouter>
            <Routes>
                {/* RUTA DE LOGIN - Redirige según rol si ya está autenticado */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ?
                            <Navigate to={getDashboardByRole(currentUser?.role)} /> :
                            <Login onLogin={handleLogin} />
                    }
                />

                {/* RUTAS PÚBLICAS */}
                <Route
                    path="/RegistrarPaciente"
                    element={
                        isAuthenticated ?
                            <Navigate to={getDashboardByRole(currentUser?.role)} /> :
                            <RegistrarPaciente />
                    }
                />
                <Route path="/Actualizar" element={<ForgotPassword />} />

                {/* PACIENTE - Solo accesible para pacientes */}
                <Route
                    path="/Home"
                    element={
                        isAuthenticated && currentUser?.role === 'PACIENTE' ?
                            <Home user={currentUser} onLogout={clearSession} /> :
                            <Navigate to="/" />
                    }
                />
                <Route
                    path="/Agendas"
                    element={
                        isAuthenticated && currentUser?.role === 'PACIENTE' ?
                            <Agendas user={currentUser} /> :
                            <Navigate to="/" />
                    }
                />

                {/* RUTAS COMPARTIDAS (para usuarios autenticados) */}
                <Route
                    path="/PatientProfile"
                    element={
                        isAuthenticated ?
                            <PatientProfile /> :
                            <Navigate to="/" />
                    }
                />
                <Route
                    path="/MedicalHistory"
                    element={
                        isAuthenticated ?
                            <MedicalHistory /> :
                            <Navigate to="/" />
                    }
                />
                <Route
                    path="/Medicines"
                    element={
                        isAuthenticated ?
                            <Medicines /> :
                            <Navigate to="/" />
                    }
                />
                <Route
                    path="/EditProfile"
                    element={
                        isAuthenticated ?
                            <EditProfile /> :
                            <Navigate to="/" />
                    }
                />

                {/* DOCTOR - Solo accesible para doctores */}
                <Route
                    path="/TableroDoctor"
                    element={
                        isAuthenticated && currentUser?.role === 'DOCTOR' ?
                            <TableroDoctor user={currentUser} onLogout={clearSession} /> :
                            <Navigate to="/" />
                    }
                />

                {/* RECEPCIONISTA - Solo accesible para recepcionistas */}
                <Route
                    path="/TableroRecepcionista"
                    element={
                        isAuthenticated && currentUser?.role === 'RECEPCIONISTA' ?
                            <TableroRecepcionista user={currentUser} onLogout={clearSession} /> :
                            <Navigate to="/" />
                    }
                />

                {/* CONSULTA MÉDICA - Solo accesible para doctores */}
                <Route
                    path="/consulta-medica"
                    element={
                        isAuthenticated && currentUser?.role === 'DOCTOR' ?
                            <ConsultaMedica /> :
                            <Navigate to="/" />
                    }
                />

                {/* Redirección para cualquier ruta no definida */}
                <Route
                    path="*"
                    element={
                        isAuthenticated ?
                            <Navigate to={getDashboardByRole(currentUser?.role)} /> :
                            <Navigate to="/" />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;