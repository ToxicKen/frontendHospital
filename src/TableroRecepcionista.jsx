import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TableroRecepcionista.css';
const TableroRecepcionista = () => {
    const navigate = useNavigate();

    // Verificación de seguridad (token)
    useEffect(() => {
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            
            {/* Barra Superior */}
            <nav className="navbar">
                <div className="nav-brand">
                    <span>Hospital San Judas Tadeo</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </nav>

            <div className="dashboard-content">
                
                <h2 className="section-title">Gestión de Personal</h2>
                <div className="action-grid">
                    
                    <div className="action-card border-personal">
                    
                        <h3>Registrar Doctor</h3>
                        <p>Dar de alta un nuevo médico con especialidad y consultorio.</p>
                        <button className="btn-card" onClick={() => navigate('/registro-doctor')}>
                            Ir a Registro
                        </button>
                    </div>

                    <div className="action-card border-personal">
                      
                        <h3>Consultar Doctores</h3>
                        <p>Ver lista de médicos activos y sus horarios.</p>
                        <button className="btn-card" onClick={() => navigate('/lista-doctores')}>
                            Ver Lista
                        </button>
                    </div>

                    <div className="action-card border-personal">
                      
                        <h3>Registrar Recepcionista</h3>
                        <p>Crear nueva cuenta administrativa para colegas.</p>
                        <button className="btn-card" onClick={() => navigate('/registro-recepcionista')}>
                            Ir a Registro
                        </button>
                    </div>

            
                    <div className="action-card border-personal">
                        
                        <h3>Consultar Personal</h3>
                        <p>Ver recepcionistas</p>
                        <button className="btn-card" onClick={() => navigate('/lista-recepcionistas')}>
                            Ver Lista
                        </button>
                    </div>

                </div>

    
                <h2 className="section-title">Atención al Paciente</h2>
                <div className="action-grid">

    
                    <div className="action-card border-paciente">
                       
                        <h3>Registrar Paciente</h3>
                        <p>Dar de alta nuevo paciente (Datos personales y contacto).</p>
                        <button className="btn-card" onClick={() => navigate('/registro-paciente')}>
                            Nuevo Paciente
                        </button>
                    </div>

                    {/* Consultar Pacientes */}
                    <div className="action-card border-paciente">
                        
                        <h3>Consultar Pacientes</h3>
                        <p>Buscar datos de contacto (Sin acceso a historial médico ni recetas).</p>
                        <button className="btn-card" onClick={() => navigate('/lista-pacientes')}>
                            Buscar Paciente
                        </button>
                    </div>

                     <div className="action-card border-paciente">
                      
                        <h3>Gestión de Citas</h3>
                        <p>Agendar nuevas citas o cancelar citas existentes.</p>
                        <button className="btn-card" onClick={() => navigate('/agendas')}>
                            Gestionar Agenda
                        </button>
                    </div>

                </div>

            
                <h2 className="section-title">Caja y Farmacia</h2>
                <div className="action-grid">

        
                    <div className="action-card border-dinero">
                        
                        <h3>Caja y Farmacia</h3>
                        <p>Venta de medicamentos y servicios</p>
                        <button className="btn-card" onClick={() => navigate('/caja')}>
                            Abrir Caja
                        </button>
                    </div>

                </div>

                <h2 className="section-title">Bitácoras del Sistema</h2>
                <div className="action-grid">

                    <div className="action-card border-sistema">
                        
                        <h3>Bitácora de Acceso</h3>
                        <p></p>
                        <button className="btn-card" onClick={() => navigate('/bitacora-accesos')}>
                            Ver Logs
                        </button>
                    </div>
 
                    <div className="action-card border-sistema">
                        
                        <h3>Bitácora de Movimientos</h3>
                        <p>Historial de cambios realizados</p>
                        <button className="btn-card" onClick={() => navigate('/bitacora-movimientos')}>
                            Ver Logs
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default TableroRecepcionista;