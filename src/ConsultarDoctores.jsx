import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios';
import './App.css'; 

export default function ConsultarDoctores() {
    const navigate = useNavigate();
    const [especialidades, setEspecialidades] = useState([]);
    const [doctores, setDoctores] = useState([]);
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Cargar Especialidades
    useEffect(() => {
        api.get('/api/especialidades')
            .then(res => setEspecialidades(res.data))
            .catch(err => console.error("Error cargando especialidades", err));
    }, []);

    // 2. Cargar Doctores
    useEffect(() => {
        if (!selectedEspecialidad) {
            setDoctores([]);
            return;
        }
        setLoading(true);
        api.get(`/api/especialidades/${selectedEspecialidad}/doctores`)
            .then(res => setDoctores(res.data))
            .catch(err => console.error("Error cargando doctores", err))
            .finally(() => setLoading(false));
    }, [selectedEspecialidad]);

    // 3. Dar de Baja
    const handleDarDeBaja = async (idDoctor, nombreDoctor) => {
        if (!window.confirm(`¿Está seguro de dar de baja al Dr. ${nombreDoctor}?`)) return;

        try {
            await api.delete(`/api/doctor/${idDoctor}`);
            alert(`El Dr. ha sido dado de baja.`);
            setDoctores(doctores.filter(d => d.idDoctor !== idDoctor));
        } catch (err) {
            if (err.response && err.response.status === 409) {
                alert("Error: El doctor tiene citas asignadas. No se puede dar de baja.");
            } else {
                alert("Error al dar de baja.");
            }
        }
    };

    return (
        <div className="dashboard-container" style={{ alignItems: 'flex-start', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
                
                {/* Título solo arriba */}
                <h2>Directorio Médico</h2>
                <hr style={{ marginBottom: '20px' }}/>

                {/* Filtros */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por Especialidad:</label>
                    <select
                        className="input-field"
                        onChange={(e) => setSelectedEspecialidad(e.target.value)}
                        value={selectedEspecialidad}
                    >
                        <option value="">-- Seleccionar --</option>
                        {especialidades.map(esp => (
                            <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Tabla */}
                {loading ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Consultorio</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctores.length > 0 ? doctores.map(doc => (
                                <tr key={doc.idDoctor}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.idDoctor}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.nombreCompleto}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.consultorio}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <button 
                                            className="btn-cancel" 
                                            style={{ background: '#d32f2f', color: 'white', padding: '5px 10px', fontSize: '0.8rem' }}
                                            onClick={() => handleDarDeBaja(doc.idDoctor, doc.nombreCompleto)}
                                        >
                                            Dar de Baja
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Seleccione una especialidad para ver doctores</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

     
                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <button 
                        onClick={() => navigate('/tableroRecepcionista')} 
                        className="btn-cancel"
                        style={{ padding: '10px 25px' }}
                    >
                        ← Volver al Tablero
                    </button>
                </div>

            </div>
        </div>
    );
}
