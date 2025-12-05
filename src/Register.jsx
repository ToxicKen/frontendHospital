import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register({ addRegister }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: "",
        apellidoP: "",
        apellidoM: "",
        curp: "",
        calle: "",
        numero: "",
        colonia: "",
        correoElectronico: "",
        contrasenia: "",
        alergias: [],
        telefonos: [],
        padecimientos: [],
        peso: "",
        estatura: "",
        tipoSangre: ""
    });

    const [error, setError] = useState("");
    const [alergiaInput, setAlergiaInput] = useState("");
    const [padecimientoInput, setPadecimientoInput] = useState({ id: "", descripcion: "" });
    const [telefonoInput, setTelefonoInput] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAlergia = () => {
        if (!alergiaInput) return;
        setFormData(prev => ({
            ...prev,
            alergias: [...prev.alergias, parseInt(alergiaInput)]
        }));
        setAlergiaInput("");
    };

    const handleRemoveAlergia = (index) => {
        setFormData(prev => ({
            ...prev,
            alergias: prev.alergias.filter((_, i) => i !== index)
        }));
    };

    const handleAddPadecimiento = () => {
        if (!padecimientoInput.id || !padecimientoInput.descripcion) return;
        setFormData(prev => ({
            ...prev,
            padecimientos: [
                ...prev.padecimientos,
                {
                    padecimientoId: parseInt(padecimientoInput.id),
                    descripcion: padecimientoInput.descripcion
                }
            ]
        }));
        setPadecimientoInput({ id: "", descripcion: "" });
    };

    const handleRemovePadecimiento = (index) => {
        setFormData(prev => ({
            ...prev,
            padecimientos: prev.padecimientos.filter((_, i) => i !== index)
        }));
    };

    const handleAddTelefono = () => {
        if (!telefonoInput) return;
        setFormData(prev => ({
            ...prev,
            telefonos: [...prev.telefonos, telefonoInput]
        }));
        setTelefonoInput("");
    };

    const handleRemoveTelefono = (index) => {
        setFormData(prev => ({
            ...prev,
            telefonos: prev.telefonos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.nombre || !formData.apellidoP || !formData.curp || !formData.correoElectronico || !formData.contrasenia) {
            setError("Por favor completa los campos obligatorios");
            return;
        }

        try {
            const payload = {
                ...formData,
                peso: formData.peso ? parseFloat(formData.peso) : null,
                estatura: formData.estatura ? parseFloat(formData.estatura) : null,
            };

            console.log('🔄 Registrando nuevo paciente...');

            const token = await addRegister(payload);

            if (token) {
                console.log('✅ Nuevo paciente registrado, token actualizado');
                navigate('/Home');
            } else {
                setError("Error al registrar paciente");
            }
        } catch (err) {
            console.error("Error en registro:", err);
            setError("Error al registrar paciente");
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Registrar Nuevo Paciente</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-section">
                        <h3>Información Personal</h3>
                        <div className="form-row">
                            <input
                                name="nombre"
                                placeholder="Nombre *"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="apellidoP"
                                placeholder="Apellido Paterno *"
                                value={formData.apellidoP}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="apellidoM"
                                placeholder="Apellido Materno"
                                value={formData.apellidoM}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <input
                                name="curp"
                                placeholder="CURP *"
                                value={formData.curp}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="correoElectronico"
                                placeholder="Correo Electrónico *"
                                type="email"
                                value={formData.correoElectronico}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="contrasenia"
                                placeholder="Contraseña *"
                                type="password"
                                value={formData.contrasenia}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Dirección</h3>
                        <div className="form-row">
                            <input
                                name="calle"
                                placeholder="Calle"
                                value={formData.calle}
                                onChange={handleChange}
                            />
                            <input
                                name="numero"
                                placeholder="Número"
                                value={formData.numero}
                                onChange={handleChange}
                            />
                            <input
                                name="colonia"
                                placeholder="Colonia"
                                value={formData.colonia}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Información Médica</h3>
                        <div className="form-row">
                            <input
                                name="peso"
                                placeholder="Peso (kg)"
                                type="number"
                                step="0.1"
                                value={formData.peso}
                                onChange={handleChange}
                            />
                            <input
                                name="estatura"
                                placeholder="Estatura (cm)"
                                type="number"
                                step="0.1"
                                value={formData.estatura}
                                onChange={handleChange}
                            />
                            <input
                                name="tipoSangre"
                                placeholder="Tipo de Sangre"
                                value={formData.tipoSangre}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Teléfonos</h3>
                        <div className="array-group">
                            <div className="input-row">
                                <input
                                    type="tel"
                                    placeholder="Número de teléfono"
                                    value={telefonoInput}
                                    onChange={(e) => setTelefonoInput(e.target.value)}
                                />
                                <button type="button" onClick={handleAddTelefono} className="btn-add">
                                    Agregar
                                </button>
                            </div>
                            <div className="items-list">
                                {formData.telefonos.map((telefono, index) => (
                                    <div key={index} className="item-tag">
                                        <span>{telefono}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTelefono(index)}
                                            className="btn-remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Alergias</h3>
                        <div className="array-group">
                            <div className="input-row">
                                <input
                                    type="number"
                                    placeholder="ID Alergia"
                                    value={alergiaInput}
                                    onChange={(e) => setAlergiaInput(e.target.value)}
                                />
                                <button type="button" onClick={handleAddAlergia} className="btn-add">
                                    Agregar
                                </button>
                            </div>
                            <div className="items-list">
                                {formData.alergias.map((alergia, index) => (
                                    <div key={index} className="item-tag">
                                        <span>ID: {alergia}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAlergia(index)}
                                            className="btn-remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Padecimientos</h3>
                        <div className="array-group">
                            <div className="input-double">
                                <input
                                    type="number"
                                    placeholder="ID Padecimiento"
                                    value={padecimientoInput.id}
                                    onChange={(e) => setPadecimientoInput(prev => ({ ...prev, id: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="Descripción"
                                    value={padecimientoInput.descripcion}
                                    onChange={(e) => setPadecimientoInput(prev => ({ ...prev, descripcion: e.target.value }))}
                                />
                                <button type="button" onClick={handleAddPadecimiento} className="btn-add">
                                    Agregar
                                </button>
                            </div>
                            <div className="items-list">
                                {formData.padecimientos.map((padecimiento, index) => (
                                    <div key={index} className="item-tag">
                                        <span>ID {padecimiento.padecimientoId}: {padecimiento.descripcion}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePadecimiento(index)}
                                            className="btn-remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit">Registrar Paciente</button>
                </form>
            </div>
        </div>
    );
}