import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const MOCK_CITAS_DOCTOR = [
    {
        idCita: 101,
        fechaHora: "2025-12-08T09:00:00",
        paciente: "Juan Pérez López",
        edad: 30,
        estatus: "PAGADA_PENDIENTE_POR_ATENDER",
        motivo: "Dolor abdominal persistente"
    },
    {
        idCita: 102,
        fechaHora: "2025-12-08T10:30:00",
        paciente: "Ana García",
        edad: 25,
        estatus: "PAGADA_PENDIENTE_POR_ATENDER",
        motivo: "Revisión general"
    },
    {
        idCita: 103,
        fechaHora: "2025-12-07T14:00:00",
        paciente: "Carlos Ruiz",
        edad: 45,
        estatus: "ATENDIDA",
        motivo: "Hipertensión"
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

    const citasFiltradas = citas.filter(c => {
        if (filtro === 'PENDIENTE') {
            return c.estatus.includes('PENDIENTE_POR_ATENDER');
        } else {
            return c.estatus === 'ATENDIDA' || c.estatus === 'NO_ACUDIO';
        }
    });

    const iniciarConsulta = (cita) => {
        navigate('/consulta-medica', { state: { cita } });
    };

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
                        Citas Pendientes
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
                        Historial de Atenciones
                    </button>
                </div>

                <div className="citas-grid" style={{ display: 'grid', gap: '20px' }}>
                    {citasFiltradas.length > 0 ? (
                        citasFiltradas.map(cita => (
                            <div key={cita.idCita} className="card appointment-card" style={{ borderLeft: '5px solid #2a9d8f' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{cita.paciente}</h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                            Fecha: {new Date(cita.fechaHora).toLocaleString()}
                                        </p>
                                        <p><strong>Motivo:</strong> {cita.motivo}</p>
                                    </div>

                                    {filtro === 'PENDIENTE' && (
                                        <button
                                            className="btn-primary"
                                            style={{ backgroundColor: '#2a9d8f' }}
                                            onClick={() => iniciarConsulta(cita)}
                                        >
                                            Atender Paciente
                                        </button>
                                    )}

                                    {filtro === 'HISTORIAL' && (
                                        <span style={{ background: '#ccc', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {cita.estatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            <h3>No hay citas en esta sección</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}