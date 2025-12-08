import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./PatientProfile.css";

const API_BASE_URL = 'http://localhost:8080/api';

export default function PatientProfile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener datos del paciente desde el endpoint
    const fetchPatientData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('No hay token de autenticación');
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/paciente/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUserData(data);
            localStorage.setItem("usuarioActual", JSON.stringify(data));
        } catch (error) {
            console.error('Error al obtener datos del paciente:', error);
            setError('No se pudieron cargar los datos del paciente');

            // Intentar recuperar de localStorage como respaldo
            const storedUser = JSON.parse(localStorage.getItem("usuarioActual"));
            if (storedUser) {
                setUserData(storedUser);
                setError(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();

        // Opcional: configurar actualización periódica
        // const interval = setInterval(fetchPatientData, 60000); // Actualizar cada minuto
        // return () => clearInterval(interval);
    }, [navigate]);

    // Formatear el tipo de sangre para mostrar
    const formatTipoSangre = (tipoSangre) => {
        if (!tipoSangre) return 'No especificado';

        // Remover guiones bajos y formatear
        return tipoSangre
            .replace(/_/g, ' ')
            .replace(/_POSITIVO/g, '+')
            .replace(/_NEGATIVO/g, '-')
            .replace('O ', 'O')
            .replace('A ', 'A')
            .replace('B ', 'B')
            .replace('AB ', 'AB');
    };

    // Función para formatear dirección
    const formatDireccion = (direccion) => {
        return direccion || 'No especificada';
    };

    // Función para manejar teléfonos
    const formatTelefonos = (telefonos) => {
        if (!telefonos || telefonos.length === 0) {
            return 'No especificados';
        }

        return telefonos.map(tel => {
            let tipo = tel.tipo?.toLowerCase() || 'teléfono';
            if (tipo === 'movil') tipo = 'Móvil';
            if (tipo === 'casa') tipo = 'Casa';
            if (tipo === 'trabajo') tipo = 'Trabajo';

            return `${tel.numero} (${tipo})`;
        }).join(', ');
    };

    // Renderizar carga
    if (loading) {
        return (
            <div className="profile-container loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando datos del paciente...</p>
            </div>
        );
    }

    // Renderizar error
    if (error && !userData) {
        return (
            <div className="profile-container error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button
                    className="btn-primary"
                    onClick={fetchPatientData}
                    style={{ marginTop: '20px' }}
                >
                    Reintentar
                </button>
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/login')}
                    style={{ marginTop: '10px', marginLeft: '10px' }}
                >
                    Volver al Login
                </button>
            </div>
        );
    }

    // Verificar si hay datos
    if (!userData) {
        return (
            <div className="profile-container">
                <h2>No hay información del paciente disponible</h2>
                <button
                    className="btn-primary"
                    onClick={fetchPatientData}
                    style={{ marginTop: '20px' }}
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h2>Datos Personales del Paciente</h2>

            <div className="profile-card">
                {/* Información Personal */}
                <div className="info-section">
                    <h3>📋 Información Personal</h3>
                    <p>
                        <b>Nombre:</b> {userData.persona?.nombreCompleto || 'No disponible'}
                    </p>
                    <p>
                        <b>CURP:</b> {userData.persona?.curp || 'No disponible'}
                    </p>
                    <p>
                        <b>Correo:</b> {userData.email || 'No disponible'}
                    </p>
                    <p>
                        <b>Dirección:</b> {formatDireccion(userData.persona?.direccion)}
                    </p>
                    <p>
                        <b>Teléfono(s):</b> {formatTelefonos(userData.persona?.telefonos)}
                    </p>
                </div>

                {/* Historial Médico */}
                {userData.historialMedico && (
                    <div className="info-section">
                        <h3>🏥 Información Médica</h3>
                        <div className="medical-info-grid">
                            <div className="medical-info-item">
                                <span className="medical-label">Peso:</span>
                                <span className="medical-value">
                  {userData.historialMedico.peso ? `${userData.historialMedico.peso} kg` : 'No registrado'}
                </span>
                            </div>
                            <div className="medical-info-item">
                                <span className="medical-label">Estatura:</span>
                                <span className="medical-value">
                  {userData.historialMedico.estatura ? `${userData.historialMedico.estatura} m` : 'No registrado'}
                </span>
                            </div>
                            <div className="medical-info-item">
                                <span className="medical-label">Tipo de Sangre:</span>
                                <span className="medical-value">
                  {formatTipoSangre(userData.historialMedico.tipoSangre)}
                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alergias */}
                <div className="info-section">
                    <h3>⚠️ Alergias</h3>
                    {userData.alergias && userData.alergias.length > 0 ? (
                        <ul className="info-list">
                            {userData.alergias.map((alergia, index) => (
                                <li key={index} className="info-list-item">
                                    {typeof alergia === 'object' ? alergia.nombre || 'Alergia sin nombre' : alergia}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data">No se han registrado alergias</p>
                    )}
                </div>

                {/* Padecimientos */}
                <div className="info-section">
                    <h3>📝 Padecimientos Crónicos</h3>
                    {userData.padecimientos && userData.padecimientos.length > 0 ? (
                        <ul className="info-list">
                            {userData.padecimientos.map((padecimiento, index) => (
                                <li key={padecimiento.id || index} className="info-list-item">
                                    <strong>{padecimiento.nombre}:</strong> {padecimiento.descripcion || 'Sin descripción'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data">No se han registrado padecimientos crónicos</p>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="action-buttons">
                    <button
                        onClick={() => navigate("/MedicalHistory")}
                        className="btn-primary"
                        disabled={!userData.historialMedico}
                        title={!userData.historialMedico ? "No hay historial médico disponible" : ""}
                    >
                        📄 Ver Historial Médico Completo
                    </button>

                    <button
                        onClick={() => navigate("/EditProfile")}
                        className="btn-primary"
                    >
                        ✏️ Editar Datos Personales
                    </button>

                    <button
                        onClick={() => navigate("/MedicalRecords")}
                        className="btn-primary"
                    >
                        🏥 Ver Expediente Médico
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => navigate("/home")}
                        style={{ marginTop: '10px' }}
                    >
                        ⬅️ Volver al Inicio
                    </button>
                </div>

                {/* Opcional: Botón para actualizar datos */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        className="btn-refresh"
                        onClick={fetchPatientData}
                        style={{
                            padding: '5px 15px',
                            fontSize: '0.9rem',
                            backgroundColor: '#e9ecef',
                            color: '#495057',
                            border: '1px solid #dee2e6'
                        }}
                    >
                        🔄 Actualizar Datos
                    </button>
                    {error && (
                        <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '5px' }}>
                            {error} (Mostrando datos en caché)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}