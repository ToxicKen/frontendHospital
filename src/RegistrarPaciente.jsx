import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios';
import './RegistrarPaciente.css';

const RegistrarPaciente = () => {
    const navigate = useNavigate();

    // 1. ESTADOS PARA CATALOGOS
    const [catalogoAlergias, setCatalogoAlergias] = useState([]);
    const [catalogoPadecimientos, setCatalogoPadecimientos] = useState([]);

    // 2. ESTADO DEL FORMULARIO
    const [form, setForm] = useState({
        nombre: '', apellidoP: '', apellidoM: '', curp: '',
        calle: '', colonia: '', numero: '',
        telefonoMovil: '', telefonoCasa: '',
        email: '', password: '',
        peso: '', estatura: '', tipoSangre: 'O_POSITIVO'
    });

    // 3. ESTADOS PARA SELECCIONES MULTIPLES (Arrays de IDs)
    const [alergiasSeleccionadas, setAlergiasSeleccionadas] = useState([]);
    const [padecimientosSeleccionados, setPadecimientosSeleccionados] = useState([]);

    // 4. ESTADO PARA NUEVAS ALERGIAS
    const [nuevasAlergias, setNuevasAlergias] = useState('');

    // --- CARGAR DATOS AL INICIAR ---
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const resAlergias = await api.get('/api/paciente/registrar/alergias');
                setCatalogoAlergias(resAlergias.data || []);

                const resPadecimientos = await api.get('/api/paciente/registrar/padecimientos');
                setCatalogoPadecimientos(resPadecimientos.data || []);
            } catch (error) {
                console.warn("Error cargando catálogos", error);
            }
        };
        cargarCatalogos();
    }, []);

    // --- MANEJADORES ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNuevasAlergiasChange = (e) => {
        setNuevasAlergias(e.target.value);
    };

    const handleAlergiaCheck = (id) => {
        setAlergiasSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handlePadecimientoCheck = (id) => {
        setPadecimientosSeleccionados(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // --- ENVIAR FORMULARIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Procesar nuevas alergias (separadas por comas)
        const nuevasAlergiasArray = nuevasAlergias
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        // Transformar Padecimientos
        const padecimientosFinales = padecimientosSeleccionados.map(id => ({
            id: id,
            nombre: null,
            descripcion: "Antecedente registrado en recepción"
        }));

        // Armar el JSON Final
        const payload = {
            registroPersonaRequest: {
                nombre: form.nombre,
                apellidoP: form.apellidoP,
                apellidoM: form.apellidoM,
                curp: form.curp,
                calle: form.calle,
                colonia: form.colonia,
                numero: form.numero,
                telefonos: [
                    {
                        numero: form.telefonoMovil,
                        tipo: "MOVIL"
                    },
                    {
                        numero: form.telefonoCasa ? form.telefonoCasa : "0000000000",
                        tipo: "CASA"
                    }
                ]
            },
            registroUsuarioRequest: {
                correoElectronico: form.email,
                contrasenia: form.password
            },
            idAlergias: alergiasSeleccionadas,
            nuevasAlergias: nuevasAlergiasArray,
            padecimientos: padecimientosFinales,
            historialMedico: {
                peso: parseFloat(form.peso || 0),
                estatura: parseFloat(form.estatura || 0),
                tipoSangre: form.tipoSangre
            }
        };

        try {
            console.log("Enviando Payload:", payload);
            const response = await api.post('/api/paciente/registrar', payload);

            console.log("Respuesta:", response.data);
            alert("✅ ¡Paciente registrado exitosamente!");
            navigate('/tableroRecepcionista');

        } catch (error) {
            console.error("Error al registrar:", error);
            const mensaje = error.response?.data?.message || "Verifica que el correo o CURP no existan.";
            alert(`❌ Error: ${mensaje}`);
        }
    };

    return (
        <div className="registro-container">
            <h2>Nuevo Paciente</h2>
            <form onSubmit={handleSubmit} className="form-grid">

                {/* 1. Datos Personales */}
                <div className="section">
                    <h3>Datos Generales</h3>
                    <div className="input-row">
                        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
                        <input name="apellidoP" placeholder="Apellido Paterno" onChange={handleChange} required />
                    </div>
                    <input name="apellidoM" placeholder="Apellido Materno" onChange={handleChange} required />
                    <input name="curp" placeholder="CURP" onChange={handleChange} required />
                    <div className="input-row">
                        <input name="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} required />
                        <input name="password" type="password" placeholder="Contraseña Temporal" onChange={handleChange} required />
                    </div>
                </div>

                {/* 2. Dirección y Contacto */}
                <div className="section">
                    <h3>Dirección y Contacto</h3>
                    <div className="input-row">
                        <input name="calle" placeholder="Calle" onChange={handleChange} required />
                        <input name="numero" placeholder="Número" onChange={handleChange} required />
                    </div>
                    <input name="colonia" placeholder="Colonia" onChange={handleChange} required />
                    <div className="input-row">
                        <input name="telefonoMovil" placeholder="Celular" onChange={handleChange} required />
                        <input name="telefonoCasa" placeholder="Tel. Casa (Opcional)" onChange={handleChange} />
                    </div>
                </div>

                {/* 3. Datos Médicos Básicos */}
                <div className="section">
                    <h3>Ficha Médica Inicial</h3>
                    <div className="input-row">
                        <input name="peso" type="number" step="0.1" placeholder="Peso (kg)" onChange={handleChange} required />
                        <input name="estatura" type="number" step="0.01" placeholder="Estatura (m)" onChange={handleChange} required />
                    </div>
                    <label>Tipo de Sangre:</label>
                    <select name="tipoSangre" onChange={handleChange} className="input-select" value={form.tipoSangre}>
                        <option value="O_POSITIVO">O+</option>
                        <option value="O_NEGATIVO">O-</option>
                        <option value="A_POSITIVO">A+</option>
                        <option value="A_NEGATIVO">A-</option>
                        <option value="B_POSITIVO">B+</option>
                        <option value="B_NEGATIVO">B-</option>
                        <option value="AB_POSITIVO">AB+</option>
                        <option value="AB_NEGATIVO">AB-</option>
                    </select>
                </div>

                {/* 4. Alergias */}
                <div className="section">
                    <h3>Alergias Conocidas</h3>
                    <div className="checkbox-grid">
                        {catalogoAlergias.length > 0 ? catalogoAlergias.map((alergia) => (
                            <div key={alergia.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    id={`alergia-${alergia.id}`}
                                    name={`alergia-${alergia.id}`}
                                    onChange={() => handleAlergiaCheck(alergia.id)}
                                    checked={alergiasSeleccionadas.includes(alergia.id)}
                                />
                                <label htmlFor={`alergia-${alergia.id}`}>
                                    {alergia.nombre}
                                </label>
                            </div>
                        )) : <p>Cargando alergias...</p>}
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <label>Nuevas alergias (separadas por comas):</label>
                        <input
                            type="text"
                            placeholder="Ej: Polen, Gluten, etc."
                            value={nuevasAlergias}
                            onChange={handleNuevasAlergiasChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                        <small style={{ color: '#666', fontSize: '12px' }}>
                            Escribe nuevas alergias separadas por comas
                        </small>
                    </div>
                </div>

                {/* 5. Padecimientos */}
                <div className="section">
                    <h3>Padecimientos Previos</h3>
                    <div className="checkbox-grid">
                        {catalogoPadecimientos.length > 0 ? catalogoPadecimientos.map((pad) => (
                            <label key={pad.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    name={`padecimiento-${pad.id}`}
                                    onChange={() => handlePadecimientoCheck(pad.id)}
                                    checked={padecimientosSeleccionados.includes(pad.id)}
                                />
                                {pad.nombre}
                            </label>
                        )) : <p>Cargando padecimientos...</p>}
                    </div>
                </div>

                <div className="button-area">
                    <button type="button" onClick={() => navigate('/tableroRecepcionista')} className="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" className="btn-save">
                        Registrar Paciente
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarPaciente;