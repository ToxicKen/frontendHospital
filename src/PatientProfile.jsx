import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./PatientProfile.css";

export default function PatientProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // 1. Intentamos traerlo desde Home (state)
    if (location.state?.user) {
      setUserData(location.state.user);
      localStorage.setItem(
        "usuarioActual",
        JSON.stringify(location.state.user)
      );
    }
    // 2. Respaldo por localStorage
    else {
      const storedUser = JSON.parse(localStorage.getItem("usuarioActual"));
      if (storedUser) setUserData(storedUser);
    }
  }, [location.state]);

  if (!userData) {
    return <h2>No hay información del paciente</h2>;
  }

  return (
    <div className="profile-container">
      <h2>Datos Personales del Paciente</h2>

      <div className="profile-card">
        <p>
          <b>Nombre:</b> {userData.nombre} {userData.apellidoP}{" "}
          {userData.apellidoM}
        </p>
        <p>
          <b>Correo:</b> {userData.correoElectronico}
        </p>
        <p>
          <b>CURP:</b> {userData.curp}
        </p>

        <p>
          <b>Dirección:</b> {userData.calle} #{userData.numero},{" "}
          {userData.colonia}
        </p>
        <p>
          <b>Teléfono:</b> {userData.telefono}
        </p>

        <p>
          <b>Peso:</b> {userData.peso} kg
        </p>
        <p>
          <b>Estatura:</b> {userData.estatura} cm
        </p>
        <p>
          <b>Tipo de sangre:</b> {userData.tipoSangre}
        </p>

        <hr />

        <p>
          <b>Alergias:</b>
        </p>
        <ul>
          {userData.alergias?.map((a, i) => (
            <li key={i}>{a.nombre ?? a}</li>
          ))}
        </ul>

        <p>
          <b>Padecimientos:</b>
        </p>
        <ul>
          {userData.padecimientos?.map((p, i) => (
            <li key={i}>
              {p.nombre} - {p.descripcion}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/MedicalHistory")}
            className="btn-primary"
          >
            📄 Ver Historial Médico
          </button>

          <button
            onClick={() => navigate("/EditProfile")}
            className="btn-primary"
          >
            ✏️ Editar Datos
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/home")}
          >
            ⬅️ Volver
          </button>
        </div>
      </div>
    </div>
  );
}
