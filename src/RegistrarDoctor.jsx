import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios'; 
import './RegistrarPaciente.css';

const RegistrarDoctor = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: '', apellidoP: '', apellidoM: '', curp: '',
        calle: '', colonia: '', numero: '',
        telefonoMovil: '', telefonoCasa: '',
        email: '', password: '',
        salario: '', cedula: '',
        idConsultorio: '', idEspecialidad: ''
    });

    // Manejador genérico para inputs
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

       
        const payload = {
            registroEmpleadoRequest: {
                registroPersonaRequest: {
                    nombre: form.nombre,
                    apellidoM: form.apellidoM,
                    apellidoP: form.apellidoP,
                    curp: form.curp,
                    calle: form.calle,
                    colonia: form.colonia,
                    numero: form.numero,
                    telefonos: [
                        { numero: form.telefonoMovil, tipo: "MOVIL" },
                        { numero: form.telefonoCasa || "Sin numero", tipo: "CASA" }
                    ]
                },
                registroUsuarioRequest: {
                    correoElectronico: form.email,
                    contrasenia: form.password
                },
                salario: parseFloat(form.salario)
            },
            cedulaProfesional: form.cedula,
            idConsultorio: parseInt(form.idConsultorio),
            idEspecialidad: parseInt(form.idEspecialidad)
        };

        try {
            // Petición al endpoint de doctores
            await api.post('/api/doctor/registro', payload);
            alert("¡Doctor registrado exitosamente!");
            navigate('/tableroRecepcionista'); // Regresar al tablero

        } catch (error) {
            console.error("Error al registrar doctor:", error);
            alert(" Error al registrar. Verifica los datos");
        }
    };

    return (
        <div className="registro-container">
            <h2>Alta de Nuevo Doctor</h2>
            <p className="subtitle">Complete la información .</p>
            
            <form onSubmit={handleSubmit} className="form-grid">
                
             
                <div className="section">
                    <h3>Datos Personales</h3>
                    <div className="input-row">
                        <input name="nombre" placeholder="Nombre(s)" onChange={handleChange} required />
                        <input name="apellidoP" placeholder="Apellido Paterno" onChange={handleChange} required />
                    </div>
                    <input name="apellidoM" placeholder="Apellido Materno" onChange={handleChange} required />
                    <input name="curp" placeholder="CURP" onChange={handleChange} required />
                </div>

               
                <div className="section">
                    <h3>Ubicación y Contacto</h3>
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

                <div className="section">
                    <h3>Acceso al Sistema</h3>
                    <input name="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
                </div>

            
                <div className="section">
                    <h3>Ficha Laboral</h3>
                    <input name="salario" type="number" placeholder="Salario Mensual ($)" onChange={handleChange} required />
                    <input name="cedula" placeholder="Cédula Profesional" onChange={handleChange} required />
                    
                    <div className="input-row">
                        <input name="idConsultorio" type="number" placeholder="ID Consultorio (Ej: 1)" onChange={handleChange} required />
                        <input name="idEspecialidad" type="number" placeholder="ID Especialidad (Ej: 1)" onChange={handleChange} required />
                    </div>
                </div>

                <div className="button-area">
                    <button type="button" onClick={() => navigate('/tableroRecepcionista')} className="btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" className="btn-save">
                        Registrar Doctor 
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarDoctor;