import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE_URL = 'http://localhost:8080';

export default function TableroDoctor() {
    const navigate = useNavigate();
    const [citas, setCitas] = useState([]);
    const [recetasHistorial, setRecetasHistorial] = useState([]);
    const [filtro, setFiltro] = useState('PENDIENTE');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingRecetas, setLoadingRecetas] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [historialData, setHistorialData] = useState(null);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('');

    const getToken = () => localStorage.getItem('token');

    const getHeaders = () => ({
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    });

    const mostrarMensaje = (texto, tipo) => {
        setMensaje(texto);
        setTipoMensaje(tipo);
        setTimeout(() => {
            setMensaje('');
            setTipoMensaje('');
        }, 3000);
    };

    // ENDPOINT 1: Obtener citas del doctor
    const fetchCitasDoctor = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/doctor/citas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error ${response.status}: ${errorData}`);
            }

            const data = await response.json();

            // Ordenar citas por fecha (más recientes primero)
            const citasOrdenadas = data.sort((a, b) =>
                new Date(b.fechaCita) - new Date(a.fechaCita)
            );

            const citasTransformadas = citasOrdenadas.map(cita => ({
                idCita: cita.folioCita,
                idPaciente: null,
                fechaHora: cita.fechaCita,
                paciente: cita.nombrePaciente,
                estatus: cita.estatus,
                consultorio: cita.consultorio,
                especialidad: cita.especialidad,
                costo: cita.costo || 0,
                nombreDoctor: cita.nombreDoctor
            }));

            setCitas(citasTransformadas);
        } catch (error) {
            console.error('Error fetching citas:', error);
            mostrarMensaje(`Error al cargar las citas: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };



// ENDPOINT 2: Obtener historial del paciente
    // ENDPOINT 2: Obtener historial del paciente
    const fetchHistorialPaciente = async (folioCita) => {
        try {
            setLoadingHistorial(true);
            const token = getToken();

            console.log(`Solicitando historial para cita: ${folioCita}`);

            const url = `${API_BASE_URL}/api/doctor/citas/${folioCita}/historialPaciente`;
            console.log('URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response status text:', response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
            }

            // Leer la respuesta como JSON directamente
            const data = await response.json();
            console.log('Datos recibidos (JSON):', data);

            // Asegurar que tenga la estructura correcta
            const historialData = {
                pacienteResponse: data.pacienteResponse || null,
                citas: data.citas || [] // Mapear citas a bitacora
            };

            setHistorialData(historialData);
            setModalVisible(true);

        } catch (error) {
            console.error('Error fetching historial:', error);
            mostrarMensaje(`Error al cargar historial: ${error.message}`, 'error');
        } finally {
            setLoadingHistorial(false);
        }
    };


    // Función para verificar si puede marcar como no acudió (1 hora y 15 minutos después)
    const puedeMarcarNoAcudio = (fechaHoraCita) => {
        try {
            const ahora = new Date();
            const fechaCita = new Date(fechaHoraCita);

            if (isNaN(fechaCita.getTime())) {
                console.error('Fecha inválida:', fechaHoraCita);
                return false;
            }

            // Agregar 1 hora y 15 minutos (75 minutos) de tolerancia
            const fechaLimite = new Date(fechaCita.getTime() + 75 * 60000);

            return ahora > fechaLimite;
        } catch (error) {
            console.error('Error calculando fecha límite:', error);
            return false;
        }
    };

    // ENDPOINT 6b: Marcar como no acudió - URL CORREGIDA
    const marcarAusencia = async (folioCita, fechaHoraCita) => {
        try {
            // Verificar si puede marcar como no acudió
            if (!puedeMarcarNoAcudio(fechaHoraCita)) {
                const fechaCita = new Date(fechaHoraCita);
                const fechaLimite = new Date(fechaCita.getTime() + 75 * 60000);
                mostrarMensaje(`Solo puede marcar como "No Acudió" después de ${fechaLimite.toLocaleTimeString()}`, 'error');
                return;
            }

            if (!window.confirm('¿Está seguro de marcar esta cita como "No Acudió"? Esta acción no se puede deshacer.')) {
                return;
            }

            // URL CORREGIDA - según el endpoint que proporcionaste
            const url = `${API_BASE_URL}/api/doctor/cita/marcarAusencia/${folioCita}`;
            console.log('Marcando ausencia en:', url);

            const response = await fetch(url, {
                method: 'PUT',
                headers: getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const resultado = await response.text();
            console.log('Resultado marcar ausencia:', resultado);

            mostrarMensaje('Cita marcada como no acudió correctamente', 'success');

            // Refrescar la lista de citas
            setTimeout(() => fetchCitasDoctor(), 1000);
        } catch (error) {
            console.error('Error marcando ausencia:', error);
            mostrarMensaje(`Error al marcar ausencia: ${error.message}`, 'error');
        }
    };

    // ENDPOINT 7: Obtener historial de recetas
    // ENDPOINT 7: Obtener historial de recetas
    const fetchRecetasHistorial = async () => {
        try {
            setLoadingRecetas(true);
            console.log('Solicitando historial de recetas...');

            const response = await fetch(`${API_BASE_URL}/api/doctor/recetas/historial`, {
                method: 'GET',
                headers: getHeaders()
            });

            console.log('Status de respuesta:', response.status);
            console.log('Status text:', response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
            }

            // IMPORTANTE: Lee la respuesta SOLO UNA VEZ
            const responseText = await response.text();
            console.log('Respuesta completa (texto):', responseText);

            if (!responseText || responseText.trim() === '') {
                console.warn('Respuesta vacía del servidor');
                setRecetasHistorial([]);
                mostrarMensaje('No hay recetas registradas', 'info');
                return;
            }

            // Parsear la respuesta como JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Error parseando JSON:', parseError);

                // Si no es JSON válido, intenta extraer información del string
                console.log('La respuesta parece ser un string, intentando extraer datos...');

                // Crear un array vacío para mostrar algo
                const recetasSimples = [];

                // Intentar extraer información básica del string
                if (responseText.includes('folioReceta=')) {
                    // Ejemplo: RecetaPDF[folioReceta=2, pacienteNombre=Ana María García Torres...
                    const recetasMatch = responseText.match(/RecetaPDF\[([^\]]+)\]/g);

                    if (recetasMatch) {
                        recetasMatch.forEach((recetaStr, index) => {
                            // Extraer datos básicos
                            const folioMatch = recetaStr.match(/folioReceta=(\d+)/);
                            const nombreMatch = recetaStr.match(/pacienteNombre=([^,]+)/);
                            const fechaMatch = recetaStr.match(/fechaEmision=([^,]+)/);

                            recetasSimples.push({
                                folioReceta: folioMatch ? parseInt(folioMatch[1]) : index + 1,
                                pacienteNombre: nombreMatch ? nombreMatch[1] : 'Paciente ' + (index + 1),
                                doctorNombre: 'Dr. ' + (currentUser?.nombre || ''),
                                fechaEmision: fechaMatch ? fechaMatch[1] : new Date().toISOString(),
                                recetaRequest: {
                                    medicamentos: [],
                                    indicaciones: 'Información no disponible en formato JSON'
                                }
                            });
                        });
                    }
                }

                data = recetasSimples.length > 0 ? recetasSimples : [];
                console.log('Datos extraídos del string:', data);
            }

            console.log('Datos procesados:', data);

            // Asegurarse de que data sea un array
            if (Array.isArray(data)) {
                setRecetasHistorial(data);
                mostrarMensaje(`Se cargaron ${data.length} recetas`, 'success');
            } else if (data && typeof data === 'object') {
                // Si es un solo objeto, convertirlo a array
                setRecetasHistorial([data]);
                mostrarMensaje('Se cargó 1 receta', 'success');
            } else {
                console.warn('Formato de datos inesperado:', data);
                setRecetasHistorial([]);
                mostrarMensaje('Formato de datos inválido', 'error');
            }

        } catch (error) {
            console.error('Error completo fetching recetas:', error);
            mostrarMensaje(`Error al cargar recetas: ${error.message}`, 'error');
            setRecetasHistorial([]);
        } finally {
            setLoadingRecetas(false);
        }
    };

    // ENDPOINT 4: Obtener PDF de receta
    const descargarRecetaPDF = async (idReceta) => {
        try {
            // URL CORREGIDA - según el endpoint que proporcionaste
            const url = `${API_BASE_URL}/api/cita/doctor/receta/${idReceta}/pdf`;
            console.log('Descargando PDF desde:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const blob = await response.blob();
            const urlBlob = window.URL.createObjectURL(blob);

            // Crear un enlace temporal y hacer clic en él
            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = `receta-${idReceta}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Limpiar URL después de un tiempo
            setTimeout(() => window.URL.revokeObjectURL(urlBlob), 100);

            mostrarMensaje('Descargando receta en PDF...', 'success');
        } catch (error) {
            console.error('Error descargando PDF:', error);
            mostrarMensaje(`Error al descargar PDF: ${error.message}`, 'error');
        }
    };

    // Función para verificar si puede crear receta (75 minutos de tolerancia)
    const puedeCrearReceta = (fechaHoraCita) => {
        try {
            const ahora = new Date();
            const fechaCita = new Date(fechaHoraCita);

            if (isNaN(fechaCita.getTime())) {
                console.error('Fecha inválida:', fechaHoraCita);
                return false;
            }

            // Agregar 75 minutos de tolerancia
            const fechaLimite = new Date(fechaCita.getTime() + 75 * 60000);

            return ahora >= fechaCita && ahora <= fechaLimite;
        } catch (error) {
            console.error('Error verificando fecha:', error);
            return false;
        }
    };

    // Navegar a crear receta
    const atenderPaciente = (cita) => {
        console.log('Intentando atender cita:', cita);

        if (!puedeCrearReceta(cita.fechaHora)) {
            const fechaCita = new Date(cita.fechaHora);
            const fechaLimite = new Date(fechaCita.getTime() + 75 * 60000);
            const ahora = new Date();

            if (ahora < fechaCita) {
                mostrarMensaje(`No puede atender al paciente antes de las ${fechaCita.toLocaleTimeString()}`, 'error');
            } else {
                mostrarMensaje(`Ya pasó el tiempo permitido para atender esta cita (hasta ${fechaLimite.toLocaleTimeString()})`, 'error');
            }
            return;
        }

        console.log('Navegando a consulta médica con cita:', cita);
        navigate('/consulta-medica', {
            state: {
                cita: {
                    ...cita,
                    // Asegurar que todos los datos necesarios estén presentes
                    idCita: cita.idCita,
                    paciente: cita.paciente,
                    fechaHora: cita.fechaHora,
                    consultorio: cita.consultorio
                }
            }
        });
    };

    useEffect(() => {
        // Obtener usuario del token o localStorage
        const user = JSON.parse(localStorage.getItem('doctor')) || { nombre: "Dr. Ejemplo", cedula: "00000000" };
        setCurrentUser(user);

        fetchCitasDoctor();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('doctor');
        navigate('/');
    };

    const citasFiltradas = citas.filter(c => {
        if (filtro === 'PENDIENTE') {
            return c.estatus.includes('PENDIENTE_POR_ATENDER');
        } else {
            return c.estatus === 'ATENDIDA' || c.estatus === 'NO_ACUDIO';
        }
    });

    const formatearFecha = (fechaHora) => {
        try {
            const fecha = new Date(fechaHora);
            if (isNaN(fecha.getTime())) {
                return 'Fecha inválida';
            }
            return fecha.toLocaleDateString('es-MX', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha inválida';
        }
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        setModalVisible(false);
        setHistorialData(null);
    };

    return (
        <div className="dashboard-layout">
            {/* Mensaje flotante */}
            {mensaje && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '15px 20px',
                    backgroundColor: tipoMensaje === 'success' ? '#4caf50' : '#f44336',
                    color: 'white',
                    borderRadius: '4px',
                    zIndex: 1000,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    maxWidth: '400px'
                }}>
                    {mensaje}
                </div>
            )}

            <nav className="navbar" style={{ backgroundColor: '#005f73', padding: '0 20px' }}>
                <div className="nav-brand" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Panel Médico - Dr. {currentUser?.nombre}</span>
                </div>
                <button
                    className="btn-logout"
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#e63946',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cerrar Sesión
                </button>
            </nav>

            <div className="dashboard-content" style={{ padding: '20px' }}>
                <div className="tabs-container" style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '30px',
                    borderBottom: '2px solid #e0e0e0',
                    paddingBottom: '10px'
                }}>
                    <button
                        onClick={() => setFiltro('PENDIENTE')}
                        style={{
                            padding: '10px 20px',
                            borderBottom: filtro === 'PENDIENTE' ? '3px solid #005f73' : 'none',
                            fontWeight: filtro === 'PENDIENTE' ? 'bold' : 'normal',
                            background: 'none',
                            cursor: 'pointer',
                            color: filtro === 'PENDIENTE' ? '#005f73' : '#666',
                            fontSize: '1rem'
                        }}
                    >
                        Pendientes por Atender
                    </button>
                    <button
                        onClick={() => setFiltro('HISTORIAL')}
                        style={{
                            padding: '10px 20px',
                            borderBottom: filtro === 'HISTORIAL' ? '3px solid #005f73' : 'none',
                            fontWeight: filtro === 'HISTORIAL' ? 'bold' : 'normal',
                            background: 'none',
                            cursor: 'pointer',
                            color: filtro === 'HISTORIAL' ? '#005f73' : '#666',
                            fontSize: '1rem'
                        }}
                    >
                        Atendidas / Historial
                    </button>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        <button
                            onClick={fetchRecetasHistorial}
                            style={{
                                padding: '10px 20px',
                                fontWeight: 'bold',
                                background: '#2a9d8f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            disabled={loadingRecetas}
                        >
                            {loadingRecetas ? 'Cargando...' : '📋 Ver Mis Recetas'}
                        </button>
                        <button
                            onClick={fetchCitasDoctor}
                            style={{
                                padding: '10px 20px',
                                fontWeight: 'bold',
                                background: '#005f73',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>

                {/* Sección de citas */}
                <div className="citas-container" style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        marginBottom: '20px',
                        color: '#005f73',
                        paddingBottom: '10px',
                        borderBottom: '2px solid #f0f0f0'
                    }}>
                        {filtro === 'PENDIENTE' ? 'Citas Pendientes' : 'Historial de Citas'}
                        <span style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            fontWeight: 'normal',
                            marginLeft: '10px'
                        }}>
                            ({citasFiltradas.length} citas)
                        </span>
                    </h3>

                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px',
                            color: '#888',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                            <p>Cargando citas...</p>
                        </div>
                    ) : citasFiltradas.length > 0 ? (
                        <div className="citas-list" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {citasFiltradas.map((cita, index) => (
                                <div key={cita.idCita} className="cita-item" style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '16px 20px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                    borderLeft: '4px solid',
                                    borderLeftColor: filtro === 'PENDIENTE' ? '#2a9d8f' :
                                        cita.estatus === 'ATENDIDA' ? '#4caf50' : '#f44336'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{
                                                backgroundColor: filtro === 'PENDIENTE' ? '#e8f4f3' :
                                                    cita.estatus === 'ATENDIDA' ? '#e8f5e9' : '#fdeaea',
                                                color: filtro === 'PENDIENTE' ? '#2a9d8f' :
                                                    cita.estatus === 'ATENDIDA' ? '#4caf50' : '#f44336',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {cita.estatus === 'PAGADA_PENDIENTE_POR_ATENDER' ? 'PENDIENTE' : cita.estatus}
                                            </span>
                                            <span style={{
                                                fontSize: '0.9rem',
                                                color: '#666',
                                                backgroundColor: '#f5f5f5',
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                📍 Consultorio {cita.consultorio}
                                            </span>
                                        </div>

                                        <h4 style={{
                                            margin: '0 0 8px 0',
                                            color: '#333',
                                            fontSize: '1.1rem'
                                        }}>
                                            👤 {cita.paciente}
                                        </h4>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '10px',
                                            fontSize: '0.9rem'
                                        }}>
                                            <div>
                                                <span style={{ color: '#666' }}>📅 </span>
                                                <strong>Fecha:</strong> {formatearFecha(cita.fechaHora)}
                                            </div>
                                            <div>
                                                <span style={{ color: '#666' }}>🎯 </span>
                                                <strong>Especialidad:</strong> {cita.especialidad}
                                            </div>
                                            <div>
                                                <span style={{ color: '#666' }}>💰 </span>
                                                <strong>Costo:</strong> ${cita.costo.toFixed(2)}
                                            </div>
                                            <div>
                                                <span style={{ color: '#666' }}>🆔 </span>
                                                <strong>Folio:</strong> {cita.idCita}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        minWidth: '200px',
                                        alignItems: 'flex-end'
                                    }}>
                                        <button
                                            className="btn-historial"
                                            onClick={() => fetchHistorialPaciente(cita.idCita)}
                                            disabled={loadingHistorial}
                                            style={{
                                                padding: '8px 16px',
                                                background: 'none',
                                                border: '1px solid #005f73',
                                                color: '#005f73',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.9rem',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            📋 {loadingHistorial ? 'Cargando...' : 'Ver Historial'}
                                        </button>

                                        {filtro === 'PENDIENTE' && (
                                            <>
                                                <button
                                                    className="btn-atender"
                                                    onClick={() => atenderPaciente(cita)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: puedeCrearReceta(cita.fechaHora) ? '#2a9d8f' : '#ccc',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: puedeCrearReceta(cita.fechaHora) ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '0.9rem',
                                                        width: '100%',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    🩺 Atender Paciente
                                                </button>

                                                <button
                                                    className="btn-no-acudio"
                                                    onClick={() => marcarAusencia(cita.idCita, cita.fechaHora)}
                                                    disabled={!puedeMarcarNoAcudio(cita.fechaHora)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: puedeMarcarNoAcudio(cita.fechaHora) ? '#e63946' : '#ccc',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: puedeMarcarNoAcudio(cita.fechaHora) ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '0.9rem',
                                                        width: '100%',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    ❌ No Acudió
                                                </button>
                                            </>
                                        )}

                                        {filtro === 'HISTORIAL' && cita.estatus === 'ATENDIDA' && (
                                            <button
                                                className="btn-receta"
                                                onClick={() => mostrarMensaje('Para ver recetas, use el botón "Ver Mis Recetas" arriba', 'info')}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#005f73',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '0.9rem',
                                                    width: '100%',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                📄 Ver Receta
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px',
                            color: '#888',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
                            <p>No hay citas en esta lista.</p>
                        </div>
                    )}
                </div>

                {/* Sección de historial de recetas */}
                {recetasHistorial.length > 0 && (
                    <div className="recetas-section" style={{ marginTop: '40px' }}>
                        <h3 style={{
                            borderBottom: '2px solid #005f73',
                            paddingBottom: '10px',
                            marginBottom: '20px',
                            color: '#005f73'
                        }}>
                            📋 Historial de Mis Recetas
                            <span style={{
                                fontSize: '0.9rem',
                                color: '#666',
                                fontWeight: 'normal',
                                marginLeft: '10px'
                            }}>
                                ({recetasHistorial.length} recetas)
                            </span>
                        </h3>
                        <div className="recetas-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '20px'
                        }}>
                            {recetasHistorial.map(receta => (
                                <div key={receta.folioReceta} className="card receta-card"
                                     style={{
                                         border: '1px solid #e0e0e0',
                                         padding: '20px',
                                         borderRadius: '8px',
                                         backgroundColor: 'white',
                                         boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                     }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginBottom: '10px'
                                            }}>
                                                <span style={{
                                                    backgroundColor: '#e8f4f3',
                                                    color: '#2a9d8f',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Receta #{receta.folioReceta}
                                                </span>
                                            </div>

                                            <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.1rem' }}>
                                                👤 {receta.pacienteNombre}
                                            </h4>

                                            <p style={{ margin: '5px 0', color: '#555', fontSize: '0.9rem' }}>
                                                <strong>📅 Fecha:</strong> {new Date(receta.fechaEmision).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            </p>

                                            <p style={{ margin: '5px 0', color: '#555', fontSize: '0.9rem' }}>
                                                <strong>💊 Medicamentos:</strong> {receta.recetaRequest?.medicamentos?.length || 0}
                                            </p>

                                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                                                <strong>📋 Indicaciones:</strong> {receta.recetaRequest?.indicaciones || 'Sin indicaciones específicas'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '15px' }}>
                                            <button
                                                className="btn-detalles"
                                                onClick={() => {
                                                    const medicamentos = receta.recetaRequest?.medicamentos || [];
                                                    const medicamentosList = medicamentos.map(m =>
                                                        `• ${m.nombre || 'Medicamento'} (${m.dosis || 'Sin dosis'}): ${m.frecuencia || 'Sin frecuencia'}`
                                                    ).join('\n');
                                                    mostrarMensaje(
                                                        `Receta #${receta.folioReceta}\n` +
                                                        `Paciente: ${receta.pacienteNombre}\n` +
                                                        `Fecha: ${new Date(receta.fechaEmision).toLocaleDateString()}\n` +
                                                        `Medicamentos:\n${medicamentosList}`,
                                                        'info'
                                                    );
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'none',
                                                    border: '1px solid #005f73',
                                                    color: '#005f73',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Ver Detalles
                                            </button>
                                            <button
                                                className="btn-pdf"
                                                onClick={() => descargarRecetaPDF(receta.folioReceta)}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#005f73',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                📥 Descargar PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal de Historial del Paciente */}
                {modalVisible && historialData && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '25px',
                            borderRadius: '10px',
                            maxWidth: '900px',
                            width: '90%',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '25px',
                                borderBottom: '2px solid #f0f0f0',
                                paddingBottom: '15px'
                            }}>
                                <h3 style={{ color: '#005f73', margin: 0 }}>📋 Historial Médico del Paciente</h3>
                                <button
                                    onClick={cerrarModal}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '28px',
                                        cursor: 'pointer',
                                        color: '#666'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Información del paciente - ADAPTADA A LA NUEVA ESTRUCTURA */}
                            {historialData.pacienteResponse ? (
                                <div style={{
                                    marginBottom: '30px',
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <h4 style={{ marginBottom: '15px', color: '#005f73', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
                                        👤 Información Personal
                                    </h4>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                        gap: '15px',
                                        fontSize: '0.95rem'
                                    }}>
                                        <div>
                                            <strong>Nombre completo:</strong><br/>
                                            {historialData.pacienteResponse.persona?.nombreCompleto || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>CURP:</strong><br/>
                                            {historialData.pacienteResponse.persona?.curp || 'No disponible'}
                                        </div>
                                        <div>
                                            <strong>Email:</strong><br/>
                                            {historialData.pacienteResponse.email || 'No disponible'}
                                        </div>
                                        <div>
                                            <strong>Dirección:</strong><br/>
                                            {historialData.pacienteResponse.persona?.direccion || 'No disponible'}
                                        </div>
                                        {historialData.pacienteResponse.persona?.telefonos && historialData.pacienteResponse.persona.telefonos.length > 0 && (
                                            <div>
                                                <strong>Teléfono:</strong><br/>
                                                {historialData.pacienteResponse.persona.telefonos[0].numero}
                                                ({historialData.pacienteResponse.persona.telefonos[0].tipo})
                                            </div>
                                        )}
                                    </div>

                                    {/* Padecimientos */}
                                    {historialData.pacienteResponse.padecimientos && historialData.pacienteResponse.padecimientos.length > 0 && (
                                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                                            <h5 style={{ color: '#2a9d8f', marginBottom: '10px' }}>🏥 Padecimientos</h5>
                                            <div style={{
                                                display: 'grid',
                                                gap: '10px',
                                                fontSize: '0.9rem'
                                            }}>
                                                {historialData.pacienteResponse.padecimientos.map((padecimiento, index) => (
                                                    <div key={index} style={{
                                                        padding: '10px',
                                                        backgroundColor: '#e8f4f3',
                                                        borderRadius: '6px'
                                                    }}>
                                                        <strong>{padecimiento.nombre}:</strong> {padecimiento.descripcion}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Alergias */}
                                    {historialData.pacienteResponse.alergias && historialData.pacienteResponse.alergias.length > 0 && (
                                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                                            <h5 style={{ color: '#e63946', marginBottom: '10px' }}>⚠️ Alergias</h5>
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '10px',
                                                fontSize: '0.9rem'
                                            }}>
                                                {historialData.pacienteResponse.alergias.map((alergia, index) => (
                                                    <span key={index} style={{
                                                        padding: '5px 10px',
                                                        backgroundColor: '#fdeaea',
                                                        color: '#721c24',
                                                        borderRadius: '4px'
                                                    }}>
                                        {alergia.nombre || alergia}
                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Datos Médicos */}
                                    {historialData.pacienteResponse.historialMedico && (
                                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                                            <h5 style={{ color: '#2a9d8f', marginBottom: '10px' }}>📊 Datos Médicos</h5>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                gap: '20px',
                                                fontSize: '0.95rem'
                                            }}>
                                                <div>
                                                    <strong>Peso:</strong><br/>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {historialData.pacienteResponse.historialMedico.peso || 'N/A'} kg
                                    </span>
                                                </div>
                                                <div>
                                                    <strong>Estatura:</strong><br/>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {historialData.pacienteResponse.historialMedico.estatura || 'N/A'} m
                                    </span>
                                                </div>
                                                <div>
                                                    <strong>Tipo de Sangre:</strong><br/>
                                                    <span style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        color: '#e63946'
                                                    }}>
                                        {historialData.pacienteResponse.historialMedico.tipoSangre || 'No registrado'}
                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{
                                    marginBottom: '30px',
                                    padding: '20px',
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '8px',
                                    border: '1px solid #ffeaa7',
                                    color: '#856404'
                                }}>
                                    <p>⚠️ No se pudo cargar la información del paciente.</p>
                                </div>
                            )}

                            {/* Citas anteriores - ADAPTADA A LA NUEVA ESTRUCTURA */}
                            <div>
                                <h4 style={{ marginBottom: '15px', color: '#005f73', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
                                    📅 Citas Anteriores ({historialData.citas?.length || 0})
                                </h4>
                                {historialData.citas && historialData.citas.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gap: '12px',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        paddingRight: '10px'
                                    }}>
                                        {historialData.citas.map((cita, index) => (
                                            <div key={cita.idHistorial || index} style={{
                                                padding: '15px',
                                                borderLeft: '4px solid #2a9d8f',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '6px',
                                                border: '1px solid #e0e0e0'
                                            }}>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '10px',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <div>
                                                        <strong>📅 Fecha:</strong> {cita.fechaCita || 'N/A'}
                                                        {cita.horaCita && (
                                                            <span> ({cita.horaCita.substring(0, 5)})</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <strong>👨‍⚕️ Doctor:</strong> {cita.nombreDoctor || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>🎯 Especialidad:</strong> {cita.especialidad || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>📍 Consultorio:</strong> {cita.consultorio || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>🆔 ID:</strong> {cita.idHistorial || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: '#666',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px dashed #ddd'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
                                        <p>No hay citas anteriores registradas</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '25px', textAlign: 'right', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                                <button
                                    onClick={cerrarModal}
                                    style={{
                                        padding: '10px 25px',
                                        backgroundColor: '#005f73',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}