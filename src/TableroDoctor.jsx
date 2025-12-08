import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';


const MOCK_CITAS_DOCTOR = [
    {
        idCita: 101,
        idPaciente: 50,
        fechaHora: new Date().toISOString(), // Pone fecha de HOY para que te deje hacer la receta
        paciente: "Juan Pérez López",
        estatus: "PAGADA_PENDIENTE_POR_ATENDER"
    },
    {
        idCita: 102,
        idPaciente: 88,
        fechaHora: "2025-12-25T10:30:00", // Fecha futura (no dejará hacer receta)
        paciente: "Ana García",
        estatus: "PAGADA_PENDIENTE_POR_ATENDER"
    },
    {
        idCita: 103,
        idPaciente: 12,
        fechaHora: "2025-11-07T14:00:00",
        paciente: "Carlos Ruiz",
        estatus: "ATENDIDA"
    }
];

export default function TableroDoctor() {
    const navigate = useNavigate();
    const [citas, setCitas] = useState([]);
    const [filtro, setFiltro] = useState('PENDIENTE');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = { nombre: "Luis Gómez", cedula: "12345678" };
        setCurrentUser(user);
        setCitas(MOCK_CITAS_DOCTOR);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // 🛑 FUNCIÓN CLAVE: Navegar a la Receta enviando los datos de la cita
    const atenderPaciente = (cita) => {
        navigate('/consulta-medica', { state: { cita } });
    };

    const citasFiltradas = citas.filter(c => {
        if (filtro === 'PENDIENTE') {
            return c.estatus.includes('PENDIENTE_POR_ATENDER');
        } else {
            return c.estatus === 'ATENDIDA' || c.estatus === 'NO_ACUDIO';
        }
    });

    return (
        <div className="dashboard-layout">
            <nav className="navbar" style={{ backgroundColor: '#005f73' }}>
                <div className="nav-brand">
                    <span>Panel Médico - Dr. {currentUser?.nombre}</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
            </nav>

            <div className="dashboard-content">
                <div className="tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setFiltro('PENDIENTE')}
                        style={{
                            padding: '10px 20px',
                            borderBottom: filtro === 'PENDIENTE' ? '3px solid #005f73' : 'none',
                            fontWeight: 'bold',
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Pendientes por Atender
                    </button>
                    <button
                        onClick={() => setFiltro('HISTORIAL')}
                        style={{
                            padding: '10px 20px',
                            borderBottom: filtro === 'HISTORIAL' ? '3px solid #005f73' : 'none',
                            fontWeight: 'bold',
                            background: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Atendidas / Historial
                    </button>
                </div>

                <div className="citas-grid" style={{ display: 'grid', gap: '15px' }}>
                    {citasFiltradas.length > 0 ? (
                        citasFiltradas.map(cita => (
                            <div key={cita.idCita} className="card appointment-card" style={{ borderLeft: '5px solid #2a9d8f', padding: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                                            {cita.paciente} <span style={{ color: '#666', fontWeight: 'normal' }}>(ID: {cita.idPaciente})</span>
                                        </h4>
                                        <p style={{ margin: 0, color: '#555' }}>
                                            <strong>Fecha:</strong> {new Date(cita.fechaHora).toLocaleString()}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
                                            Folio: {cita.idCita}
                                        </p>
                                    </div>

                                    {filtro === 'PENDIENTE' && (
                                        <button
                                            className="btn-primary"
                                            style={{ backgroundColor: '#2a9d8f' }}
                                            onClick={() => atenderPaciente(cita)}
                                        >
                                            Atender
                                        </button>
                                    )}

                                    {filtro === 'HISTORIAL' && (
                                        <span style={{ background: '#e0e0e0', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {cita.estatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            <p>No hay citas en esta lista.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
