import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // ⬅️ AÑADE useEffect
import "./home.css";

export default function PagePrincipal({ user, onLogout, lastAppointment, onLoadLastAppointment }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const comeA = () => navigate("/Agendas");

    const handleLogout = () => {
        onLogout();
    };

    useEffect(() => {
        if (user?.id && onLoadLastAppointment) {
            console.log('🔄 Cargando última cita al entrar a Home...');
            onLoadLastAppointment(user.id);
        }
    }, [user?.id, onLoadLastAppointment]); // Se ejecuta cuando user.id cambia







    // Función para formatear la fecha y hora del DTO
    const formatDateTime = (fechaHoraCita) => {
        if (!fechaHoraCita) return 'No disponible';

        const date = new Date(fechaHoraCita);
        return {
            date: date.toLocaleDateString('es-MX'),
            time: date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            day: date.toLocaleDateString('es-MX', { weekday: 'long' })
        };
    };

    return (
        <>
            <div className="navbar">
                <button className="btnmenu" onClick={toggleMenu}>☰</button>
                <h2 style={{ textAlign: "center" }}>Página Principal</h2>

                <div className={`sidebar ${isMenuOpen ? "active" : ""}`}>
                    <div className="sidebar-header">
                        <h3>Menú</h3>
                        <button className="close-btn" onClick={toggleMenu}>×</button>
                    </div>
                    <div className="sidebar-content">
                        {user ? (
                            <>
                                <div className="user-info">
                                    <h2>Bienvenido</h2>
                                    <p>
                                        <strong>{user.name}</strong>
                                        <br />
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                </div>

                                <hr style={{ borderColor: "#000", backgroundColor: "#000" }} />

                                <button className="btn-home" onClick={handleLogout}>🚪 Cerrar sesión</button>
                            </>
                        ) : (
                            <p>Error en la página</p>
                        )}
                    </div>
                </div>
                {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
            </div>

            <div className="home-container">
                <div className="action-section">
                    <button className="btn-primary" onClick={comeA}>📅 Agendar Nueva Cita</button>
                </div>

                {/* --- Caso 1: Hay última cita --- */}
                {lastAppointment && (
                    <div className="appointment-card">
                        <h3>Tu Próxima Cita</h3>
                        <div className="appointment-details">
                            <p><strong>Folio:</strong> {lastAppointment.folioCita}</p>
                            <p><strong>Paciente:</strong> {lastAppointment.pacienteNombre}</p>
                            <p><strong>Doctor:</strong> {lastAppointment.doctorNombre}</p>

                            {/* Fecha y hora formateadas */}
                            {(() => {
                                const formatted = formatDateTime(lastAppointment.fechaHoraCita);
                                return (
                                    <>
                                        <p><strong>Fecha:</strong> {formatted.date}</p>
                                        <p><strong>Día:</strong> {formatted.day}</p>
                                        <p><strong>Hora:</strong> {formatted.time}</p>
                                    </>
                                );
                            })()}

                            <p><strong>Estatus:</strong> {lastAppointment.estatus}</p>
                        </div>
                    </div>
                )}

                {/* --- Caso 2: No hay Citas --- */}
                {!lastAppointment && (
                    <div className="no-appointments">
                        <h3>No tienes citas agendadas</h3>
                        <p>Agenda tu primera cita médica haciendo clic en el botón de arriba.</p>
                    </div>
                )}
            </div>
        </>
    );
}