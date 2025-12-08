import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

export default function ConsultaMedica() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cita } = location.state || {};

    const [formData, setFormData] = useState({
        folioCita: cita?.idCita || '',
        diagnostico: '',
        observaciones: ''
    });

    const [medicamentos, setMedicamentos] = useState([
        { nombre: '', tratamiento: '', cantidad: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const getToken = () => localStorage.getItem('token');

    const getHeaders = () => ({
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMedicamentoChange = (index, field, value) => {
        const newMedicamentos = [...medicamentos];
        newMedicamentos[index][field] = value;
        setMedicamentos(newMedicamentos);
    };

    const addMedicamento = () => {
        setMedicamentos([...medicamentos, { nombre: '', tratamiento: '', cantidad: '' }]);
    };

    const removeMedicamento = (index) => {
        if (medicamentos.length > 1) {
            const newMedicamentos = medicamentos.filter((_, i) => i !== index);
            setMedicamentos(newMedicamentos);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que todos los medicamentos tengan nombre
        const medicamentosInvalidos = medicamentos.some(med => !med.nombre.trim());
        if (medicamentosInvalidos) {
            alert('Todos los medicamentos deben tener un nombre');
            return;
        }

        const recetaData = {
            folioCita: parseInt(formData.folioCita),
            diagnostico: formData.diagnostico,
            observaciones: formData.observaciones,
            medicamentos: medicamentos.map(med => ({
                nombre: med.nombre,
                tratamiento: med.tratamiento,
                cantidad: parseInt(med.cantidad) || 0
            }))
        };

        try {
            setLoading(true);

            // 1. Crear la receta
            const response = await fetch(`${API_BASE_URL}/api/cita/doctor/receta`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(recetaData)
            });

            if (!response.ok) {
                throw new Error('Error al crear receta');
            }

            const data = await response.json();
            const idReceta = data.idReceta;

            setMensaje(`Receta creada exitosamente. ID: ${idReceta}. Descargando PDF...`);

            // 2. Descargar el PDF automáticamente
            try {
                await descargarRecetaPDF(idReceta);
                setMensaje(`Receta #${idReceta} creada y descargada correctamente`);
            } catch (pdfError) {
                console.error('Error descargando PDF:', pdfError);
                setMensaje(`Receta creada (ID: ${idReceta}), pero hubo un error al descargar el PDF. Puede descargarlo manualmente después.`);
            }

            // 3. Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/doctor');
            }, 3000);

        } catch (error) {
            console.error('Error creando receta:', error);
            setMensaje('Error al crear receta. Verifique los datos.');
        } finally {
            setLoading(false);
        }
    };

// Función para descargar el PDF
    const descargarRecetaPDF = async (idReceta) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/cita/doctor/receta/${idReceta}/pdf`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al descargar receta');
            }

            const blob = await response.blob();

            // Crear un enlace temporal y hacer clic en él
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receta-${idReceta}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Limpiar URL después de un tiempo
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            return true;
        } catch (error) {
            console.error('Error descargando PDF:', error);
            throw error;
        }
    };

    if (!cita) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>No se encontró información de la cita</h2>
                <button onClick={() => navigate('/doctor')}>Volver al Tablero</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2>Consulta Médica - Crear Receta</h2>

            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                <h3>Información de la Cita</h3>
                <p><strong>Paciente:</strong> {cita.paciente}</p>
                <p><strong>Fecha:</strong> {new Date(cita.fechaHora).toLocaleString()}</p>
                <p><strong>Folio:</strong> {cita.idCita}</p>
                <p><strong>Consultorio:</strong> {cita.consultorio}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Diagnóstico:
                        <textarea
                            name="diagnostico"
                            value={formData.diagnostico}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', minHeight: '80px', padding: '8px' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Observaciones:
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            style={{ width: '100%', minHeight: '80px', padding: '8px' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3>Medicamentos</h3>
                    {medicamentos.map((med, index) => (
                        <div key={index} style={{
                            border: '1px solid #ddd',
                            padding: '15px',
                            marginBottom: '10px',
                            borderRadius: '4px'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                                <div>
                                    <label>Nombre:</label>
                                    <input
                                        type="text"
                                        value={med.nombre}
                                        onChange={(e) => handleMedicamentoChange(index, 'nombre', e.target.value)}
                                        required
                                        placeholder="Ej: Paracetamol 500mg"
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Tratamiento:</label>
                                    <input
                                        type="text"
                                        value={med.tratamiento}
                                        onChange={(e) => handleMedicamentoChange(index, 'tratamiento', e.target.value)}
                                        required
                                        placeholder="Ej: Cada 8 horas por 7 días"
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label>Cantidad:</label>
                                    <input
                                        type="number"
                                        value={med.cantidad}
                                        onChange={(e) => handleMedicamentoChange(index, 'cantidad', e.target.value)}
                                        required
                                        min="1"
                                        placeholder="Ej: 21"
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeMedicamento(index)}
                                    disabled={medicamentos.length === 1}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: medicamentos.length === 1 ? '#ccc' : '#e63946',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: medicamentos.length === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addMedicamento}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#2a9d8f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        + Agregar Medicamento
                    </button>
                </div>

                {mensaje && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: mensaje.includes('Error') ? '#f8d7da' : '#d4edda',
                        color: mensaje.includes('Error') ? '#721c24' : '#155724',
                        marginBottom: '20px',
                        borderRadius: '4px'
                    }}>
                        {mensaje}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: loading ? '#ccc' : '#005f73',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creando...' : 'Generar Receta'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/doctor')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}