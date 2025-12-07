import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // ⬅️ AÑADE useEffect
import "./home.css";

export default function PagePrincipal({ user, onLogout, lastAppointment, onLoadLastAppointment }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const comeA = () => navigate("/Agendas");
    const aPtPf = () => {
    navigate("/PatientProfile", {
      state: { user },
    });
  };
  const aM = () => navigate("/Medicines");

    const handleLogout = () => {
        onLogout();
    };

    useEffect(() => {
        if (user?.id && onLoadLastAppointment) {
            console.log('🔄 Cargando última cita al entrar a Home...');
            onLoadLastAppointment(user.id);
        }
    }, [user?.id, onLoadLastAppointment]); // Se ejecuta cuando user.id cambia

    // Función para formatear la fecha y hora del DTO
    const formatDateTime = (fechaHoraCita) => {
        if (!fechaHoraCita) return 'No disponible';

        const date = new Date(fechaHoraCita);
        return {
            date: date.toLocaleDateString('es-MX'),
            time: date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            day: date.toLocaleDateString('es-MX', { weekday: 'long' })
        };
    };

    //Extra del front (puede haber fallas por compatibilidad)
    const [citas, setCitas] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [mostrarPago, setMostrarPago] = useState(false);
  const [montoPago, setMontoPago] = useState("");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    const citasLS = JSON.parse(localStorage.getItem("citas")) || [];
    const mias = citasLS.filter((c) => c.userId === user.id);
    setCitas(mias);
  }, [user.id]);

  const citasFiltradas = citas.filter((cita) => {
    if (cita.estatus === "CANCELADA") return false; // ⬅️ OCULTA CANCELADAS

    const fecha = new Date(cita.fechaHoraCita);

    const filtroFecha =
      (!fechaInicio || fecha >= new Date(fechaInicio)) &&
      (!fechaFin || fecha <= new Date(fechaFin));

    const filtroStatus = !filtroEstatus || cita.estatus === filtroEstatus;

    return filtroFecha && filtroStatus;
  });

  const cancelarCitaPorId = (idCita) => {
    const todas = JSON.parse(localStorage.getItem("citas")) || [];

    const actualizadas = todas.map((c) =>
      c.id === idCita ? { ...c, estatus: "CANCELADA" } : c
    );

    localStorage.setItem("citas", JSON.stringify(actualizadas));

    const mias = actualizadas.filter((c) => c.userId === user.id);
    setCitas(mias);

    onLoadLastAppointment(mias[mias.length - 1] || null);

    alert("✅ Cita cancelada correctamente");
  };
    
   return (
    <>
      <div className="navbar">
        <button className="btnmenu" onClick={toggleMenu}>
          ☰
        </button>
        <h2 style={{ textAlign: "center" }}>Página Principal</h2>

        <div className={`sidebar ${isMenuOpen ? "active" : ""}`}>
          <div className="sidebar-header">
            <h3>Menú</h3>
            <button className="close-btn" onClick={toggleMenu}>
              ×
            </button>
          </div>
          <div className="sidebar-content">
            {/* Aqui se encuentra el menu desplegable */}
            {user ? (
              <>
                <div className="user-info">
                  <h2>Bienvenido</h2>
                  <p>
                    <strong>
                      {user.nombre} {user.apellidoP}
                    </strong>
                    <br />
                    <strong>Email:</strong> {user.correoElectronico}
                  </p>
                </div>

                <hr style={{ borderColor: "#000", backgroundColor: "#000" }} />
                <div style={{ height: "15vh" }}></div>
                <>
                  <div style={{ display: "flex" }}>
                    <button className="btn-home" onClick={aPtPf}>
                      Ver datos personales
                    </button>
                    <p
                      style={{
                        color: "black",
                        marginTop: "3vh",
                        fontSize: "13px",
                      }}
                    >
                      ← Visualiza tus datos e historial medico
                    </p>
                    <br />
                  </div>
                  <div style={{ display: "flex" }}>
                    <button className="btn-home" onClick={aM}>
                      Consultar medicamentos en stock
                    </button>
                    <p
                      style={{
                        color: "black",
                        marginTop: "5vh",
                        fontSize: "13px",
                      }}
                    >
                      {" "}
                      ← Consulta la existencia de tus medicamentos
                    </p>
                    <br />
                  </div>
                  <div>
                    <button className="btn-home" onClick={handleLogout}>
                      🚪 Cerrar sesión
                    </button>
                  </div>
                </>
              </>
            ) : (
              <p>Error en la página</p>
            )}
          </div>
        </div>
        {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
      </div>

      <div className="home-container">
        <div className="action-section">
          <button className="btn-primary" onClick={comeA}>
            📅 Agendar Nueva Cita
          </button>
        </div>

        <div className="filters">
          <select onChange={(e) => setFiltroEstatus(e.target.value)}>
            <option value="">Todos los estatus</option>
            <option value="PENDIENTE_PAGO">Pendiente de pago</option>
            <option value="PAGADA">Pagada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <input type="date" onChange={(e) => setFechaInicio(e.target.value)} />
          <input type="date" onChange={(e) => setFechaFin(e.target.value)} />
        </div>

        {/* --- Caso 1: Hay última cita --- */}
        <h3>Todas tus citas</h3>

        {citasFiltradas.map((cita) => {
          const f = formatDateTime(cita.fechaHoraCita);

          return (
            <div className="appointment-card" key={cita.id}>
              <p>
                <strong>Folio:</strong> {cita.folioCita}
              </p>
              <p>
                <strong>Doctor:</strong> {cita.doctorNombre}
              </p>
              <p>
                <strong>Fecha:</strong> {f.date}
              </p>
              <p>
                <strong>Hora:</strong> {f.time}
              </p>
              <p>
                <strong>Estatus:</strong> {cita.estatus}
              </p>
              <p>
                <strong>Total:</strong> ${cita.total}
              </p>

              {cita.estatus?.includes("PENDIENTE") && (
                <button
                  className="btn-pay"
                  onClick={() => {
                    setCitaSeleccionada(cita);
                    setMostrarPago(true);
                  }}
                >
                  💳 Pagar
                </button>
              )}

              {cita.estatus !== "CANCELADA" && (
                <button
                  className="btn-cancel"
                  onClick={() => cancelarCitaPorId(cita.id)}
                >
                  ❌ Cancelar Cita
                </button>
              )}
            </div>
          );
        })}

        {/* --- Caso 2: No hay Citas --- */}
        {citasFiltradas.length === 0 && (
          <div className="no-appointments">
            <h3>No tienes citas pendientes</h3>
            <p>Agenda una nueva cita cuando lo necesites.</p>
          </div>
        )}

        {mostrarPago && (
          <div className="modal">
            <div className="modal-content">
              <h3>Pagar Cita {citaSeleccionada.folioCita}</h3>

              <p>Total a pagar: ${citaSeleccionada.total}</p>

              <input
                type="number"
                placeholder="Monto a pagar"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
              />

              <div className="modal-actions">
                <button
                  onClick={() => {
                    const todas =
                      JSON.parse(localStorage.getItem("citas")) || [];

                    const actualizadas = todas.map((c) =>
                      c.id === citaSeleccionada.id
                        ? { ...c, estatus: "PAGADA" }
                        : c
                    );

                    localStorage.setItem("citas", JSON.stringify(actualizadas));

                    const mias = actualizadas.filter(
                      (c) => c.userId === user.id
                    );
                    setCitas(mias);

                    onLoadLastAppointment(mias[mias.length - 1]); // ←🔥 ESTO ES CLAVE

                    setMostrarPago(false);
                    setMontoPago("");

                    alert(`✅ Pago realizado: $${montoPago}`);
                  }}
                >
                  Confirmar Pago
                </button>

                <button onClick={() => setMostrarPago(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
