import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Home from "./Home.jsx";
import Agendas from "./Agendas.jsx";
import api from "./axios.js";

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lastAppointment, setLastAppointment] = useState(null);
    const [pacienteData, setPacienteData] = useState(null);

    // 🔹 Debug: Ver token actual
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('🔐 Token actual:', {
                    userId: decoded.id || decoded.sub,
                    email: decoded.email || decoded.sub
                });
            } catch (err) {
                console.log('❌ Token inválido');
            }
        }
    }, [currentUser]);

    // 🔹 Cargar usuario desde token al iniciar
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const user = {
                id: decoded.id || decoded.sub,
                email: decoded.email || decoded.sub,
                name: decoded.name || "",
            };
            setCurrentUser(user);
            setIsAuthenticated(true);

            // Cargar datos después de confirmar el usuario
            loadPacienteData(user.id);
            loadLastAppointment(user.id);
        } catch (err) {
            console.error("Token inválido o expirado:", err);
            clearSession();
        }
    }, []);

    // 🔹 Función para limpiar completamente la sesión
    const clearSession = () => {
        localStorage.removeItem("token");
        setCurrentUser(null);
        setIsAuthenticated(false);
        setLastAppointment(null);
        setPacienteData(null);
    };

    // 🔹 Cargar datos del paciente
    const loadPacienteData = async (userId) => {
        try {
            const res = await api.get(`/api/paciente/${userId}/datos`);
            setPacienteData(res.data);
        } catch (err) {
            console.error("Error cargando datos del paciente:", err);
            setPacienteData(null);
            if (err.response?.status === 403 || err.response?.status === 401) {
                clearSession();
            }
        }
    };

    // 🔹 Cargar la última cita del usuario
    const loadLastAppointment = async (userId) => {
        try {
            console.log('🔄 Buscando última cita para userId:', userId);
            const res = await api.get(`/api/citas/paciente/${userId}/ultima`);
            console.log('📦 Datos de la cita:', res.data);
            setLastAppointment(res.data || null);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                console.log('ℹ️ No se encontraron citas (404)');
                setLastAppointment(null);
            } else {
                console.error("Error cargando la última cita:", err);
                setLastAppointment(null);
            }
        }
    };

    // 🔹 Login
    const handleLogin = async (email, password) => {
        try {
            // ⬅️ LIMPIAR SESIÓN ANTERIOR
            clearSession();

            const res = await api.post("/auth/login", {
                username: email,
                password: password
            });

            const token = res.data.token;
            if (!token) throw new Error("No se recibió token");

            localStorage.setItem("token", token);

            const decoded = jwtDecode(token);
            const user = {
                id: decoded.id || decoded.sub,
                email: decoded.email || decoded.sub,
                name: decoded.name || "",
            };

            setCurrentUser(user);
            setIsAuthenticated(true);

            // Cargar datos después del login
            await loadPacienteData(user.id);
            await loadLastAppointment(user.id);

            return true;
        } catch (err) {
            console.error("Error en login:", err);
            return false;
        }
    };
// 🔹 Registro

    const addRegister = async (formData) => {
        try {
            // ⬅️ IMPORTANTE: Limpiar token anterior ANTES del registro
            localStorage.removeItem("token");
            setCurrentUser(null);
            setIsAuthenticated(false);
            setLastAppointment(null);
            setPacienteData(null);

            const res = await api.post("/auth/registrar", formData);
            const token = res.data.token;
            if (!token) throw new Error("No se recibió token");

            localStorage.setItem("token", token);

            const decoded = jwtDecode(token);
            const user = {
                id: decoded.id || decoded.sub,
                email: decoded.email || decoded.sub,
                name: decoded.name || "",
            };

            setCurrentUser(user);
            setIsAuthenticated(true);

            // Cargar datos después del registro
            await loadPacienteData(user.id);
            await loadLastAppointment(user.id);

            return token;
        } catch (err) {
            console.error("Error en registro:", err);
            return null;
        }
    };

    // 🔹 Crear cita
    const addAppointment = async (appointmentData) => {
        try {
            const res = await api.post("/api/registrar/cita", appointmentData);
            // Actualizar la última cita después de crear una nueva
            await loadLastAppointment(currentUser.id);
            return res.data;
        } catch (err) {
            console.error("Error al agregar cita:", err);
            return null;
        }
    };

    // 🔹 Logout
    const handleLogout = () => {
        clearSession();
    };

    return (
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <Routes>
                <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to="/Home" /> : <Login onLogin={handleLogin} />}
                />

                <Route
                    path="/Register"
                    element={isAuthenticated ? <Navigate to="/Home" /> : <Register addRegister={addRegister} />}
                />

                <Route
                    path="/Home"
                    element={
                        isAuthenticated ? (
                            <Home
                                user={currentUser}
                                pacienteData={pacienteData}
                                lastAppointment={lastAppointment}
                                onLogout={handleLogout}
                                onLoadLastAppointment={loadLastAppointment}
                            />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />

                <Route
                    path="/Agendas"
                    element={
                        isAuthenticated ? (
                            <Agendas
                                user={currentUser}
                                pacienteData={pacienteData}
                                onAddAppointment={addAppointment}
                            />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />

                <Route
                    path="*"
                    element={isAuthenticated ? <Navigate to="/Home" /> : <Navigate to="/" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;