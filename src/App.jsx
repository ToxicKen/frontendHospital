import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Home from "./Home.jsx";
import Agendas from "./Agendas.jsx";
import ForgotPassword from "./Actualizar.jsx";
import PatientProfile from "./PatientProfile.jsx";
import MedicalHistory from "./MedicalHistory.jsx";
import Medicines from "./Medicines.jsx";
import EditProfile from "./EditProfile.jsx";
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

    /* COMO SE USO EN FRONT
    useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);

      const citas = JSON.parse(localStorage.getItem("citas")) || [];
      const ultima = citas.filter((c) => c.userId === user.id).slice(-1)[0];
      setLastAppointment(ultima || null);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioActual"));
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadPacienteData(user.id);
      loadLastAppointment(user.id);
    }
  }, []);
  */

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
    /*// 🔹 Cargar datos del paciente
  const loadPacienteData = (userId) => {
    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    const paciente = pacientes.find((p) => p.userId === userId) || null;
    setPacienteData(paciente);
  };*/

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
    /*
    // 🔹 Cargar la última cita del usuario ->FRONT
  const loadLastAppointment = (userId) => {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const userCitas = citas.filter((c) => c.userId === userId);
    const ultima = userCitas[userCitas.length - 1] || null;
    setLastAppointment(ultima);
  };
  */

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
 /*
 // 🔹 Login ->FRONT
  const handleLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userFound = users.find(
      (u) => u.correoElectronico === email && u.password === password
    );

    if (!userFound) {
      return false; // Login incorrecto
    }

    setCurrentUser(userFound);
    setIsAuthenticated(true);

    localStorage.setItem("currentUser", JSON.stringify(userFound));

    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const ultima = citas.filter((c) => c.userId === userFound.id).slice(-1)[0];

    setLastAppointment(ultima || null);

    return userFound;
  };
 */
    
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
 
    /*
    // 🔹 Registro ->FRONT
    const addRegister = (nuevoUsuario) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    nuevoUsuario.id = crypto.randomUUID();
    nuevoUsuario.password = nuevoUsuario.contrasenia;

    users.push(nuevoUsuario);
    localStorage.setItem("users", JSON.stringify(users));

    // ✅ AUTENTICAR AUTOMÁTICAMENTE AL REGISTRAR
    setCurrentUser(nuevoUsuario);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(nuevoUsuario));

    return true;
  };
    */

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
    /*
    // 🔹 Crear cita->FRONT
  const addAppointment = (appointmentData) => {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];

    appointmentData.id = Date.now();
    appointmentData.userId = currentUser.id;

    citas.push(appointmentData);
    localStorage.setItem("citas", JSON.stringify(citas));

    loadLastAppointment(currentUser.id);

    return appointmentData;
  };
    */

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
          element={
            isAuthenticated ? (
              <Navigate to="/Home" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route path="/Actualizar" element={<ForgotPassword />} />

        <Route
          path="/Register"
          element={
            isAuthenticated ? (
              <Navigate to="/Home" />
            ) : (
              <Register addRegister={addRegister} />
            )
          }
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
          element={
            isAuthenticated ? <Navigate to="/Home" /> : <Navigate to="/" />
          }
        />

        <Route path="/PatientProfile" element={<PatientProfile />} />

        <Route
          path="/MedicalHistory"
          element={isAuthenticated ? <MedicalHistory /> : <Navigate to="/" />}
        />

        <Route
          path="/Medicines"
          element={isAuthenticated ? <Medicines /> : <Navigate to="/" />}
        />

        <Route path="/EditProfile" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
    );
}

export default App;
