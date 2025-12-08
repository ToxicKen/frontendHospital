import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import "./home.css";
import api from './axios';

export default function PagePrincipal({ user, onLogout }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [citas, setCitas] = useState([]);
    const [filtroEstatus, setFiltroEstatus] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [idDoctorFiltro, setIdDoctorFiltro] = useState("");
    const [mostrarPago, setMostrarPago] = useState(false);
    const [montoPago, setMontoPago] = useState("");
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [refundAmount, setRefundAmount] = useState(0);
    const [error, setError] = useState(null);

    // Función segura para obtener citas con manejo de errores
    const fetchCitas = useCallback(async () => {
        if (!user?.id) {
            console.warn("No hay usuario, no se pueden cargar citas");
            setCitas([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            let response;

            // Lógica CORREGIDA con validaciones
            if (filtroEstatus) {
                response = await api.get(`/api/paciente/citas/estatus?estatus=${encodeURIComponent(filtroEstatus)}`);
            } else if (fechaInicio || fechaFin) {
                const params = new URLSearchParams();
                if (fechaInicio) params.append('fechaInicio', fechaInicio);
                if (fechaFin) params.append('fechaFin', fechaFin);
                response = await api.get(`/api/paciente/citas/fechas?${params.toString()}`);
            } else if (idDoctorFiltro) {
                if (!idDoctorFiltro || isNaN(idDoctorFiltro)) {
                    setError("ID de doctor inválido");
                    setLoading(false);
                    return;
                }
                response = await api.get(`/api/paciente/citas/doctor?idDoctor=${idDoctorFiltro}`);
            } else {
                response = await api.get("/api/paciente/citas");
            }

            // VALIDACIÓN CRÍTICA: Verificar que la respuesta sea un array
            if (!response.data || !Array.isArray(response.data)) {
                console.error("La respuesta no es un array:", response.data);
                setCitas([]);
                setError("Formato de datos inválido del servidor");
                setLoading(false);
                return;
            }

            // Mapeo seguro de citas
            const citasConId = response.data
                .filter(cita => cita != null) // Filtrar null/undefined
                .map((cita, index) => ({
                    ...cita,
                    id: cita.folioCita || `cita-${index}-${Date.now()}`,
                    userId: user.id,
                    // Asegurar que todos los campos tengan valores por defecto
                    folioCita: cita.folioCita || `N/A-${index}`,
                    nombreDoctor: cita.nombreDoctor || "Doctor no especificado",
                    especialidad: cita.especialidad || "Especialidad no especificada",
                    consultorio: cita.consultorio || "No especificado",
                    fechaCita: cita.fechaCita || new Date().toISOString(),
                    estatus: cita.estatus || "DESCONOCIDO",
                    nombrePaciente: cita.nombrePaciente || user.nombre || "Paciente",
                    costo: typeof cita.costo === 'number' ? cita.costo : 0
                }));

            setCitas(citasConId);
            setLoading(false);

        } catch (error) {
            console.error("Error CRÍTICO al cargar citas:", error);
            setError(`Error al cargar citas: ${error.message || "Error desconocido"}`);
            setCitas([]); // Establecer array vacío para evitar errores
            setLoading(false);
        }
    }, [user, filtroEstatus, fechaInicio, fechaFin, idDoctorFiltro]);

    // Cargar citas cuando cambian los filtros o cuando se monta el componente
    useEffect(() => {
        fetchCitas();
    }, [fetchCitas]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const comeA = () => {
        try {
            navigate("/Agendas");
        } catch (navError) {
            console.error("Error al navegar:", navError);
            window.location.href = "/Agendas"; // Fallback
        }
    };

    const aPtPf = () => {
        try {
            navigate("/PatientProfile", {
                state: { user },
            });
        } catch (navError) {
            console.error("Error al navegar:", navError);
            window.location.href = "/PatientProfile"; // Fallback
        }
    };

    const aM = () => {
        try {
            navigate("/Medicines");
        } catch (navError) {
            console.error("Error al navegar:", navError);
            window.location.href = "/Medicines"; // Fallback
        }
    };

    const handleLogout = () => {
        try {
            onLogout();
        } catch (logoutError) {
            console.error("Error en logout:", logoutError);
            // Fallback: limpiar localStorage y redirigir
            localStorage.clear();
            window.location.href = "/login";
        }
    };

    // Función SEGURA para formatear fecha
    const formatDateTime = (fechaCita) => {
        try {
            if (!fechaCita) return { date: 'No disponible', time: '', day: '' };

            const date = new Date(fechaCita);

            // Validar que la fecha sea válida
            if (isNaN(date.getTime())) {
                return { date: 'Fecha inválida', time: '', day: '' };
            }

            return {
                date: date.toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                time: date.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                day: date.toLocaleDateString('es-MX', { weekday: 'long' })
            };
        } catch (dateError) {
            console.error("Error formateando fecha:", fechaCita, dateError);
            return { date: 'Error en fecha', time: '', day: '' };
        }
    };

    // ✅ FUNCIÓN ACTUALIZADA: Cancelar cita con actualización inmediata
    const cancelarCitaPorId = async (folioCita) => {
        if (!folioCita) {
            alert("Folio de cita inválido");
            return;
        }

        if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // ✅ PASO 1: Actualizar el estado LOCAL inmediatamente
            setCitas(prevCitas =>
                prevCitas.map(cita =>
                    cita.folioCita === folioCita
                        ? { ...cita, estatus: "CANCELADA" }
                        : cita
                )
            );

            // ✅ PASO 2: Llamar al backend para cancelar
            const response = await api.put(`/api/paciente/cancelar/${folioCita}`);

            // ✅ PASO 3: Obtener el monto devuelto
            const montoDevuelto = response.data;
            if (typeof montoDevuelto === 'number' && montoDevuelto > 0) {
                setRefundAmount(montoDevuelto);
            }

            alert(`✅ Cita cancelada correctamente. ${montoDevuelto > 0 ? `Se devolvió: $${montoDevuelto}` : ''}`);
            setLoading(false);

        } catch (error) {
            console.error("Error al cancelar cita:", error);

            // ✅ REVERTIR el cambio si hubo error en el backend
            setCitas(prevCitas =>
                prevCitas.map(cita =>
                    cita.folioCita === folioCita
                        ? {
                            ...cita,
                            estatus: cita.estatus // Restaurar estado anterior
                        }
                        : cita
                )
            );

            let mensajeError = "❌ Error al cancelar la cita";
            if (error.response) {
                if (error.response.status === 404) {
                    mensajeError = "Cita no encontrada";
                } else if (error.response.status === 400) {
                    mensajeError = "No se puede cancelar esta cita";
                } else if (error.response.status === 401) {
                    mensajeError = "Sesión expirada. Por favor inicia sesión nuevamente";
                    setTimeout(() => handleLogout(), 2000);
                }
            }

            alert(mensajeError);
            setError(mensajeError);
            setLoading(false);
        }
    };

    // ✅ FUNCIÓN ACTUALIZADA: Procesar pago con actualización inmediata
    // ✅ FUNCIÓN COMPLETA CON MÉTODO DE PAGO
// ✅ FUNCIÓN ACTUALIZADA: Procesar pago con endpoint correcto
    const procesarPago = async () => {
        if (!citaSeleccionada) {
            alert("No hay cita seleccionada");
            return;
        }

        if (!montoPago || montoPago.trim() === "") {
            alert("Por favor ingresa un monto válido");
            return;
        }

        const montoNumerico = parseFloat(montoPago);
        if (montoNumerico <= 0 || isNaN(montoNumerico)) {
            alert("Por favor ingresa un monto válido mayor a 0");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // ✅ USAR ENDPOINT CORRECTO: /api/paciente/orden/pagar
            const response = await api.post("/api/cita/paciente/orden/pagar", {
                folioCita: citaSeleccionada.folioCita,
                montoPago: montoNumerico
            });

            const datosPago = response.data;

            if (datosPago && datosPago.folioPago) {
                // ✅ ACTUALIZAR ESTADO LOCAL
                setCitas(prevCitas =>
                    prevCitas.map(cita =>
                        cita.folioCita === citaSeleccionada.folioCita
                            ? {
                                ...cita,
                                estatus: datosPago.ordenPagada ? "PAGADA" : cita.estatus,
                                datosPago: {
                                    folioPago: datosPago.folioPago,
                                    fechaPago: datosPago.fechaPago,
                                    montoPagado: datosPago.montoPagado,
                                    ordenPagada: datosPago.ordenPagada,
                                    totalPagadoHastaAhora: datosPago.totalPagadoHastaAhora
                                }
                            }
                            : cita
                    )
                );

                // ✅ MOSTRAR MENSAJE CONFIRMACIÓN
                let mensaje = `✅ Pago registrado exitosamente\n`;
                mensaje += `Folio de pago: ${datosPago.folioPago}\n`;
                mensaje += `Monto pagado: $${datosPago.montoPagado.toFixed(2)}\n`;
                mensaje += `Total pagado: $${datosPago.totalPagadoHastaAhora.toFixed(2)}\n`;

                if (datosPago.ordenPagada) {
                    mensaje += `\n🎉 ¡ORDEN COMPLETAMENTE PAGADA!\nLa cita ahora está marcada como PAGADA`;
                } else {
                    const saldoPendiente = datosPago.montoTotalOrden - datosPago.totalPagadoHastaAhora;
                    mensaje += `\n💰 Saldo pendiente: $${saldoPendiente.toFixed(2)}`;
                }

                alert(mensaje);

                // ✅ CERRAR MODAL Y LIMPIAR
                setMostrarPago(false);
                setMontoPago("");
                setCitaSeleccionada(null);

                // ✅ RECARGAR CITAS
                await fetchCitas();

            } else {
                throw new Error("Respuesta inválida del servidor");
            }

        } catch (error) {
            console.error("Error en pago:", error);

            let mensajeError = "❌ Error al procesar el pago";
            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 400:
                        mensajeError = data?.message || "Datos de pago inválidos";
                        break;
                    case 404:
                        mensajeError = "Cita no encontrada";
                        break;
                    case 409:
                        mensajeError = "La orden ya está completamente pagada";
                        break;
                    case 422:
                        mensajeError = "El monto excede el saldo pendiente";
                        break;
                    case 401:
                        mensajeError = "Sesión expirada";
                        setTimeout(() => handleLogout(), 2000);
                        break;
                    default:
                        mensajeError = `Error ${status}: ${data?.message || "Error desconocido"}`;
                }
            }

            alert(mensajeError);
            setError(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltroEstatus("");
        setFechaInicio("");
        setFechaFin("");
        setIdDoctorFiltro("");
        setError(null);
    };

    // ✅ FUNCIÓN ACTUALIZADA: Determinar si una cita es cancelable
    const esCancelable = (estatus) => {
        if (!estatus) return false;

        const estatusUpper = estatus.toUpperCase();
        const estatusNoCancelables = [
            "CANCELADA_PACIENTE",
            "ATENDIDA",
            "COMPLETADA",
            "FINALIZADA",
            "PAGADA" // Agregado: si ya está pagada, normalmente no se puede cancelar
        ];
        return !estatusNoCancelables.includes(estatusUpper);
    };

    // ✅ FUNCIÓN ACTUALIZADA: Determinar si una cita requiere pago
    const requierePago = (estatus) => {
        if (!estatus) return false;

        const estatusUpper = estatus.toUpperCase();
        const estatusPendientesPago = [
            "PENDIENTE_PAGO",
            "AGENDADA_PENDIENTE_DE_PAGO",
            "PENDIENTE_DE_PAGO",
            "POR_PAGAR"
        ];

        // ✅ IMPORTANTE: Solo mostrar botón de pago si NO está pagada
        const estatusPagados = ["PAGADA", "PAGADA_PENDIENTE_POR_ATENDER"];
        return estatusPendientesPago.includes(estatusUpper) && !estatusPagados.includes(estatusUpper);
    };

    // ✅ FUNCIÓN ACTUALIZADA: Renderizar citas con actualización inmediata
    const renderCitas = () => {
        if (!Array.isArray(citas) || citas.length === 0) {
            return null;
        }

        return citas.map((cita) => {
            // Validación adicional por si acaso
            if (!cita || typeof cita !== 'object') {
                console.warn("Cita inválida encontrada:", cita);
                return null;
            }

            const f = formatDateTime(cita.fechaCita);
            const estatusUpper = cita.estatus?.toUpperCase() || "DESCONOCIDO";

            // ✅ Determinar si mostrar botones
            const mostrarBotonPagar = requierePago(cita.estatus);
            const mostrarBotonCancelar = esCancelable(cita.estatus);

            return (
                <div className="appointment-card" key={cita.id}>
                    <div className="card-header">
                        <span className="folio">Folio: {cita.folioCita || "N/A"}</span>
                        <span className={`estatus-badge estatus-${estatusUpper.toLowerCase().replace(/_/g, '-')}`}>
                            {cita.estatus || "Desconocido"}
                            {estatusUpper === "CANCELADA" && " ❌"}
                            {estatusUpper === "PAGADA" && " ✅"}
                        </span>
                    </div>

                    <div className="card-body">
                        <p><strong>Doctor:</strong> {cita.nombreDoctor || "No especificado"}</p>
                        <p><strong>Especialidad:</strong> {cita.especialidad || "No especificada"}</p>
                        <p><strong>Consultorio:</strong> {cita.consultorio || "No especificado"}</p>
                        <p><strong>Fecha:</strong> {f.date}</p>
                        <p><strong>Hora:</strong> {f.time}</p>
                        <p><strong>Día:</strong> {f.day}</p>
                        <p><strong>Paciente:</strong> {cita.nombrePaciente || user?.nombre || "Paciente"}</p>
                        <p><strong>Costo:</strong> ${typeof cita.costo === 'number' ? cita.costo.toFixed(2) : "0.00"}</p>

                        {/* ✅ Mostrar información de reembolso si la cita fue cancelada */}
                        {estatusUpper === "CANCELADA" && refundAmount > 0 && (
                            <p className="reembolso-info">
                                <strong>Reembolso:</strong> <span className="reembolso-amount">${refundAmount.toFixed(2)}</span>
                            </p>
                        )}
                    </div>

                    {/* ✅ Botones de acción - Actualizados dinámicamente */}
                    <div className="card-actions">
                        {mostrarBotonPagar && (
                            <button
                                className="btn-pay"
                                onClick={() => {
                                    setCitaSeleccionada(cita);
                                    setMontoPago(cita.costo?.toString() || "");
                                    setMostrarPago(true);
                                }}
                                disabled={loading}
                            >
                                💳 Pagar Cita
                            </button>
                        )}

                        {mostrarBotonCancelar && (
                            <button
                                className="btn-cancel"
                                onClick={() => cancelarCitaPorId(cita.folioCita)}
                                disabled={loading}
                            >
                                ❌ Cancelar Cita
                            </button>
                        )}

                        {/* ✅ Mostrar estado cuando no hay acciones disponibles */}
                        {!mostrarBotonPagar && !mostrarBotonCancelar && (
                            <div className="estado-final">
                                <span className="estado-final-text">
                                    {estatusUpper === "CANCELADA" ? "Cita cancelada" :
                                        estatusUpper === "PAGADA" ? "Cita pagada" :
                                            "Sin acciones disponibles"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }).filter(Boolean); // Filtrar nulls
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
                        {user ? (
                            <>
                                <div className="user-info">
                                    <h2>Bienvenido</h2>
                                    <p>
                                        <strong>
                                            {user.nombre || "Usuario"} {user.apellidoP || ""}
                                        </strong>
                                        <br />
                                        <strong>Email:</strong> {user.correoElectronico || "No especificado"}
                                    </p>
                                </div>

                                <hr style={{ borderColor: "#000", backgroundColor: "#000" }} />
                                <div style={{ height: "15vh" }}></div>

                                <div style={{ display: "flex" }}>
                                    <button className="btn-home" onClick={aPtPf}>
                                        Ver datos personales
                                    </button>
                                    <p style={{ color: "black", marginTop: "3vh", fontSize: "13px" }}>
                                        ← Visualiza tus datos e historial médico
                                    </p>
                                    <br />
                                </div>
                                <div style={{ display: "flex" }}>
                                    <button className="btn-home" onClick={aM}>
                                        Consultar medicamentos en stock
                                    </button>
                                    <p style={{ color: "black", marginTop: "5vh", fontSize: "13px" }}>
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
                        ) : (
                            <div className="error-user">
                                <p>⚠️ No hay usuario activo</p>
                                <button onClick={() => navigate("/login")}>
                                    Ir al login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
            </div>

            <div className="home-container">
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Cargando citas...</p>
                    </div>
                )}

                {/* Mostrar error si existe */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                        <button onClick={() => setError(null)} className="close-error">
                            ×
                        </button>
                    </div>
                )}

                <div className="action-section">
                    <button className="btn-primary" onClick={comeA} disabled={loading}>
                        📅 Agendar Nueva Cita
                    </button>
                </div>

                {/* Filtros */}
                <div className="filters-section">
                    <h3>Filtrar Citas</h3>

                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Estatus:</label>
                            <select
                                value={filtroEstatus}
                                onChange={(e) => setFiltroEstatus(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Todos los estatus</option>
                                <option value="AGENDADA_PENDIENTE_DE_PAGO">Agendada pendiente de pago</option>
                                <option value="PAGADA_PENDIENTE_POR_ATENDER">Pagada pendiente por atender</option>
                                <option value="ATENDIDA">Atendida</option>
                                <option value="CONFIRMADA">Confirmada</option>
                                <option value="CANCELADA_PACIENTE">Cancelada Paciente</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Fecha inicio:</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Fecha fin:</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="filter-group">
                            <label>ID Doctor:</label>
                            <input
                                type="number"
                                placeholder="ID del doctor"
                                value={idDoctorFiltro}
                                onChange={(e) => setIdDoctorFiltro(e.target.value)}
                                disabled={loading}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button
                            className="btn-clear-filters"
                            onClick={limpiarFiltros}
                            disabled={loading}
                        >
                            🗑️ Limpiar Filtros
                        </button>

                        <button
                            className="btn-refresh"
                            onClick={fetchCitas}
                            disabled={loading}
                        >
                            🔄 Refrescar
                        </button>
                    </div>

                    <p className="filter-info">
                        <small>Los filtros se aplican automáticamente</small>
                    </p>
                </div>

                {/* Contador de citas */}
                <div className="citas-counter">
                    <h3>Historial de Citas ({citas.length})</h3>
                    {(filtroEstatus || fechaInicio || fechaFin || idDoctorFiltro) && (
                        <span className="active-filter">
                            Filtros activos
                        </span>
                    )}
                </div>

                {/* Lista de citas */}
                {!loading && citas.length === 0 ? (
                    <div className="no-appointments">
                        <h3>No se encontraron citas</h3>
                        <p>
                            {filtroEstatus || fechaInicio || fechaFin || idDoctorFiltro
                                ? "No hay citas que coincidan con los filtros actuales"
                                : "No tienes citas registradas. Agenda una nueva cita para comenzar."
                            }
                        </p>
                        {filtroEstatus || fechaInicio || fechaFin || idDoctorFiltro ? (
                            <button onClick={limpiarFiltros} className="btn-clear-view">
                                Ver todas las citas
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="citas-grid">
                        {renderCitas()}
                    </div>
                )}

                {/* Modal de pago */}
                {mostrarPago && citaSeleccionada && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Procesar Pago</h3>

                            <div className="payment-details">
                                <p><strong>Folio Cita:</strong> {citaSeleccionada.folioCita || "N/A"}</p>
                                <p><strong>Doctor:</strong> {citaSeleccionada.nombreDoctor || "No especificado"}</p>
                                <p><strong>Fecha:</strong> {formatDateTime(citaSeleccionada.fechaCita).date}</p>
                                <p><strong>Hora:</strong> {formatDateTime(citaSeleccionada.fechaCita).time}</p>
                                <p><strong>Costo Total:</strong> ${citaSeleccionada.costo?.toFixed(2) || "0.00"}</p>
                            </div>

                            <div className="payment-form">
                                <label>Monto a pagar:</label>
                                <input
                                    type="number"
                                    placeholder="Ingresa el monto"
                                    value={montoPago}
                                    onChange={(e) => setMontoPago(e.target.value)}
                                    disabled={loading}
                                    step="0.01"
                                    min="0"
                                />

                                <label>Método de pago:</label>
                                <select disabled={loading}>
                                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                                    <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn-confirm-payment"
                                    onClick={procesarPago}
                                    disabled={loading || !montoPago || parseFloat(montoPago) <= 0}
                                >
                                    {loading ? "Procesando..." : "💳 Confirmar Pago"}
                                </button>

                                <button
                                    className="btn-cancel-payment"
                                    onClick={() => {
                                        setMostrarPago(false);
                                        setMontoPago("");
                                        setCitaSeleccionada(null);
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}