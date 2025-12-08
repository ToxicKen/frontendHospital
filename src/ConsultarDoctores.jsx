import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios';
import './App.css'; 

export default function ConsultarDoctores() {
    const navigate = useNavigate();
    const [especialidades, setEspecialidades] = useState([]);
    const [doctores, setDoctores] = useState([]);
    const [selectedEspecialidadId, setSelectedEspecialidadId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    
    useEffect(() => {
        const cargarEspecialidades = async () => {
            try {
                
                const res = await api.get('/api/cita/especialidades');
                setEspecialidades(res.data);
            } catch (err) {
                setError("Error al cargar especialidades");
            }
        };
        cargarEspecialidades();
    }, []);

    useEffect(() => {
        if (!selectedEspecialidadId) {
            setDoctores([]);
            return;
        }

        const cargarDoctores = async () => {
            setLoading(true);
            setError(null);
            try {
            
                const res = await api.get(`/api/cita/especialidades/${selectedEspecialidadId}/doctores`);
                setDoctores(res.data);
            } catch (err) {
                setError(`No hay doctores registrados para esta especialidad.`);
            } finally {
                setLoading(false);
            }
        };
        cargarDoctores();
    }, [selectedEspecialidadId]);

    const handleChangeEspecialidad = (e) => {
        
        setSelectedEspecialidadId(e.target.value); 
    };

    return (
        <div className="dashboard-container" style={{ alignItems: 'flex-start' }}>
            <div className="registro-container" style={{ maxWidth: '900px', marginTop: '20px', textAlign: 'left' }}>
                <h2>Consultar Doctores</h2>
                <hr style={{ marginBottom: '20px' }} />

                <div className="filter-controls" style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por Especialidad:</label>
                    <select
                        onChange={handleChangeEspecialidad}
                        value={selectedEspecialidadId}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Seleccionar Especialidad --</option>
                        {especialidades.map(esp => (
                            <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                                {esp.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                
                {error && <div className="estil-error">{error}</div>}
                
                {loading ? (
                    <p>Cargando lista de doctores...</p>
                ) : doctores.length > 0 ? (
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>ID Doctor</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Nombre Completo</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Especialidad</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Consultorio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctores.map(doc => (
                                <tr key={doc.idDoctor}>
                                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{doc.idDoctor}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{doc.nombreCompleto}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{doc.especialidad}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{doc.consultorio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Selecciona una especialidad para ver la lista de doctores</p>
                )}
                
                <button 
                    onClick={() => navigate('/tableroRecepcionista')} 
                    className="btn-cancel" 
                    style={{ marginTop: '30px' }}
                >
                    ← Volver al Tablero
                </button>
            </div>
        </div>
    );
}