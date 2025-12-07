import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./MedicalHistory.css";

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);

  const formatDateTime = (fechaHoraCita) => {
    if (!fechaHoraCita) return { date: "No disponible" };

    const date = new Date(fechaHoraCita);
    return {
      date: date.toLocaleDateString("es-MX"),
      time: date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  useEffect(() => {
    // ✅ SACAMOS USUARIO DESDE LOCALSTORAGE
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
      console.warn("No hay usuario logueado");
      return;
    }

    const todas = JSON.parse(localStorage.getItem("citas")) || [];

    const soloCanceladas = todas.filter(
      (c) => c.userId === user.id && c.estatus === "CANCELADA"
    );

    setHistorial(soloCanceladas);
  }, []);

  return (
    <div className="history-container">
      <h2>Historial Médico</h2>

      {historial.length === 0 && (
        <p className="no-history">No hay citas en el historial.</p>
      )}

      {historial.map((cita) => {
        const f = formatDateTime(cita.fechaHoraCita);

        return (
          <div className="historial-card" key={cita.id}>
            <p><b>Folio:</b> {cita.folioCita}</p>
            <p><b>Doctor:</b> {cita.doctorNombre}</p>
            <p><b>Fecha:</b> {f.date}</p>
            <p><b>Estatus:</b> {cita.estatus}</p>
          </div>
        );
      })}

      <button className="btn-secondary" onClick={() => navigate("/perfil")}>
        Volver al Perfil
      </button>
    </div>
  );
}
