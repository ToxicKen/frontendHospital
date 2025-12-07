import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioActual"));
    setFormData(user);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("usuarioActual", JSON.stringify(formData));
    setMensaje("✅ Datos actualizados correctamente");
    setTimeout(() => navigate("/PatientProfile"), 1500);
  };

  if (!formData) return null;

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h2>Editar Datos Personales</h2>

        {mensaje && <div className="success-msg">{mensaje}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" />
            <input name="apellidoP" value={formData.apellidoP} onChange={handleChange} placeholder="Apellido Paterno" />
            <input name="apellidoM" value={formData.apellidoM} onChange={handleChange} placeholder="Apellido Materno" />
          </div>

          <div className="form-row">
            <input name="curp" value={formData.curp} onChange={handleChange} placeholder="CURP" />
            <input name="correoElectronico" value={formData.correoElectronico} onChange={handleChange} placeholder="Correo" />
          </div>

          <div className="form-row">
            <input name="calle" value={formData.calle} onChange={handleChange} placeholder="Calle" />
            <input name="numero" value={formData.numero} onChange={handleChange} placeholder="Número" />
            <input name="colonia" value={formData.colonia} onChange={handleChange} placeholder="Colonia" />
          </div>

          <div className="form-row">
            <input name="peso" type="number" value={formData.peso || ""} onChange={handleChange} placeholder="Peso" />
            <input name="estatura" type="number" value={formData.estatura || ""} onChange={handleChange} placeholder="Estatura" />
            <input name="tipoSangre" value={formData.tipoSangre || ""} onChange={handleChange} placeholder="Tipo de sangre" />
          </div>

          <div className="form-row">
            <input name="contrasenia" type="password" value={formData.contrasenia} onChange={handleChange} placeholder="Nueva contraseña" />
          </div>

          <div className="button-row">
            <button type="submit" className="btn-save">Guardar Cambios</button>
            <button type="button" className="btn-cancel" onClick={() => navigate("/PatientProfile")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
