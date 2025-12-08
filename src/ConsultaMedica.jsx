import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';

export default function ConsultaMedica() {
    const location = useLocation();
    const navigate = useNavigate();
    const cita = location.state?.cita; // Recibimos los datos del tablero

    const [diagnostico, setDiagnostico] = useState('');
    const [tratamiento, setTratamiento] = useState('');
    const [medicamentos, setMedicamentos] = useState([]);
    const [nuevoMed, setNuevoMed] = useState({ nombre: '', dosis: '', duracion: '' });
    const [esHoy, setEsHoy] = useState(true);

    // Validación de fecha al cargar (Requisito Rúbrica)
    useEffect(() => {
        if (cita) {
            const fechaCita = new Date(cita.fechaHora).toDateString();
            const fechaHoy = new Date().toDateString();
            setEsHoy(fechaCita === fechaHoy);
        }
    }, [cita]);

    if (!cita) return <div style={{ padding: '20px' }}>Error: No hay cita seleccionada.</div>;

    const agregarMedicamento = (e) => {
        e.preventDefault();
        if (nuevoMed.nombre && nuevoMed.duracion) {
            setMedicamentos([...medicamentos, nuevoMed]);
            setNuevoMed({ nombre: '', dosis: '', duracion: '' });
        } else {
            alert("Nombre y duración son obligatorios.");
        }
    };

    const finalizarConsulta = () => {
        if (!diagnostico || !tratamiento) {
            alert("Diagnóstico y tratamiento son obligatorios.");
            return;
        }

        const recetaFinal = {
            numReceta: Math.floor(Math.random() * 10000),
            fecha: new Date().toISOString(),
            idPaciente: cita.idPaciente, // Pasando su ID
            nombrePaciente: cita.paciente,
            nombreMedico: "Dr. Luis Gómez", // Simulado (Usuario Logueado)
            diagnostico,
            medicamentos,
            tratamiento,
            duracion: "Ver detalle medicamentos"
        };

        console.log("Generando Receta:", recetaFinal);
        alert(`✅ Receta #${recetaFinal.numReceta} generada correctamente.`);
        navigate('/tableroDoctor');
    };

    return (
        <div className="dashboard-container" style={{ alignItems: 'flex-start', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                
                {/* Encabezado Receta */}
                <div style={{ borderBottom: '2px solid #005f73', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h2>Receta Médica</h2>
                        <span>Fecha: {new Date().toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ color: '#2a9d8f', marginTop: 0 }}>Dr. Luis Gómez</h3>
                    <p><strong>Paciente:</strong> {cita.paciente} (ID: {cita.idPaciente})</p>
                </div>

                {!esHoy && (
                    <div className="estil-error" style={{ marginBottom: '15px' }}>
                        ⚠️ No puedes editar: La cita no es hoy.
                    </div>
                )}

                <fieldset disabled={!esHoy} style={{ border: 'none', padding: 0 }}>
                    
                    <div className="form-section" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Diagnóstico:</label>
                        <textarea
                            className="input-field"
                            rows="2"
                            style={{ width: '100%' }}
                            value={diagnostico}
                            onChange={(e) => setDiagnostico(e.target.value)}
                        />
                    </div>

                    <div className="form-section" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Medicamentos:</label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', background: '#f0f8ff', padding: '10px' }}>
                            <input type="text" placeholder="Nombre" style={{ flex: 2 }} value={nuevoMed.nombre} onChange={e => setNuevoMed({...nuevoMed, nombre: e.target.value})} />
                            <input type="text" placeholder="Dosis" style={{ flex: 1 }} value={nuevoMed.dosis} onChange={e => setNuevoMed({...nuevoMed, dosis: e.target.value})} />
                            <input type="text" placeholder="Duración" style={{ flex: 1 }} value={nuevoMed.duracion} onChange={e => setNuevoMed({...nuevoMed, duracion: e.target.value})} />
                            <button onClick={agregarMedicamento} className="btn-save" style={{ padding: '5px 15px' }}>+</button>
                        </div>

                        {medicamentos.length > 0 && (
                            <ul style={{ paddingLeft: '20px' }}>
                                {medicamentos.map((m, i) => (
                                    <li key={i}><strong>{m.nombre}</strong> - {m.dosis} durante {m.duracion}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-section" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Tratamiento General:</label>
                        <textarea
                            className="input-field"
                            rows="3"
                            style={{ width: '100%' }}
                            value={tratamiento}
                            onChange={(e) => setTratamiento(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button onClick={() => navigate('/tableroDoctor')} className="btn-cancel">Cancelar</button>
                        <button onClick={finalizarConsulta} className="confirm-button" style={{ background: '#2a9d8f' }}>Generar</button>
                    </div>
                </fieldset>
            </div>
        </div>
    );
}