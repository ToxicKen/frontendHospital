import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios'; 
import './RegistrarPaciente.css'; 

const RegistrarPaciente = () => {
    const navigate = useNavigate();

   
    const [catalogoAlergias, setCatalogoAlergias] = useState([]);
    const [catalogoPadecimientos, setCatalogoPadecimientos] = useState([]);

    
    const [form, setForm] = useState({
        nombre: '', apellidoP: '', apellidoM: '', curp: '',
        calle: '', colonia: '', numero: '',
        telefonoMovil: '', telefonoCasa: '',
        email: '', password: '',
        peso: '', estatura: '', tipoSangre: 'O+'
    });

    // 3. ESTADOS PARA SELECCIONES MULTIPLES (Arrays de IDs)
    const [alergiasSeleccionadas, setAlergiasSeleccionadas] = useState([]);
    const [padecimientosSeleccionados, setPadecimientosSeleccionados] = useState([]);

    // --- CARGAR DATOS AL INICIAR ---
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                // Cargamos las listas para que la recepcionista solo de "check"
                const resAlergias = await api.get('/api/paciente/registrar/alergias');
                setCatalogoAlergias(resAlergias.data || []);

                const resPadecimientos = await api.get('/api/paciente/registrar/padecimientos');
                setCatalogoPadecimientos(resPadecimientos.data || []);
            } catch (error) {
                console.warn("No se cargaron catálogos (Usando modo manual o error de red)", error);
            }
        };
        cargarCatalogos();
    }, []);

    // --- MANEJADORES ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Función para manejar los Checkboxes de Alergias
    const handleAlergiaCheck = (id) => {
        if (alergiasSeleccionadas.includes(id)) {
            setAlergiasSeleccionadas(alergiasSeleccionadas.filter(item => item !== id));
        } else {
            setAlergiasSeleccionadas([...alergiasSeleccionadas, id]);
        }
    };

    // Función para manejar los Checkboxes de Padecimientos
    const handlePadecimientoCheck = (id) => {
        if (padecimientosSeleccionados.includes(id)) {
            setPadecimientosSeleccionados(padecimientosSeleccionados.filter(item => item !== id));
        } else {
            setPadecimientosSeleccionados([...padecimientosSeleccionados, id]);
        }
    };

    // --- ENVIAR FORMULARIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construir los objetos de padecimientos como pide el endpoint
        const padecimientosFinales = padecimientosSeleccionados.map(id => ({
            id: id,
            descripcion: "Diagnóstico inicial registrado por recepción" 
        }));

        // ARMAMOS EL JSON EXACTO
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
                    { numero: form.telefonoMovil, tipo: "MOVIL" },
                    { numero: form.telefonoCasa || "0000000000", tipo: "CASA" }
                ]
            },
            registroUsuarioRequest: {
                correoElectronico: form.email,
                contrasenia: form.password
            },
            idAlergias: alergiasSeleccionadas,
            nuevasAlergias: [], 
            padecimientos: padecimientosFinales,
            historialMedico: {
                peso: parseFloat(form.peso || 0),
                estatura: parseFloat(form.estatura || 0),
                tipoSangre: form.tipoSangre
            }
        };

        try {
            console.log("Enviando Paciente:", payload);
            await api.post('/api/paciente/registrar', payload);
            
            alert("✅ ¡Paciente registrado exitosamente!");
    
            navigate('/tableroRecepcionista'); 
            
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("❌ Error al registrar paciente. Verifica que el correo o CURP no existan.");
        }
    };

    return (
        <div className="registro-container">
            <h2>Nuevo Paciente (Recepción)</h2>
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
                    <input name="telefonoMovil" placeholder="Celular" onChange={handleChange} required />
                </div>

                {/* 3. Datos Médicos Básicos */}
                <div className="section">
                    <h3>Ficha Médica Inicial</h3>
                    <div className="input-row">
                        <input name="peso" type="number" step="0.1" placeholder="Peso (kg)" onChange={handleChange} required />
                        <input name="estatura" type="number" step="0.01" placeholder="Estatura (m)" onChange={handleChange} required />
                    </div>
                    <label>Tipo de Sangre:</label>
                    <select name="tipoSangre" onChange={handleChange} className="input-select">
                        <option value="O_POSITIVO">O+</option>
                        <option value="O_NEGATIVO">O-</option>
                        <option value="A_POSITIVO">A+</option>
                        <option value="B_POSITIVO">B+</option>
                        {/* Agrega los demás si quieres */}
                    </select>
                </div>

                {/* 4. Alergias (Checkboxes Dinámicos) */}
                <div className="section">
                    <h3>Alergias Conocidas</h3>
                    <div className="checkbox-grid">
                        {catalogoAlergias.length > 0 ? catalogoAlergias.map((alergia) => (
                            <label key={alergia.id} className="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    onChange={() => handleAlergiaCheck(alergia.id)}
                                />
                                {alergia.nombre}
                            </label>
                        )) : <p>No hay alergias cargadas.</p>}
                    </div>
                </div>

                {/* 5. Padecimientos (Checkboxes Dinámicos) */}
                <div className="section">
                    <h3>Padecimientos Previos</h3>
                    <div className="checkbox-grid">
                        {catalogoPadecimientos.length > 0 ? catalogoPadecimientos.map((pad) => (
                            <label key={pad.id} className="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    onChange={() => handlePadecimientoCheck(pad.id)}
                                />
                                {pad.nombre}
                            </label>
                        )) : <p>No hay padecimientos cargados.</p>}
                    </div>
                </div>

                <div className="button-area">
                    <button type="button" onClick={() => navigate('/tableroRecepcionista')} className="btn-cancel">Cancelar</button>
                    <button type="submit" className="btn-save">Registrar Paciente </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarPaciente;