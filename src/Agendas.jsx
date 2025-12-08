import React, { useState, useEffect } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./Agendas.css";
import api from './axios.js';
import { useNavigate } from "react-router-dom";

export default function Agendas({
                                    user,
                                    pacienteData,
                                    onAddAppointment,
                                    appointments,
                                }) {

    const [step, setStep] = useState(1);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [appointmentData, setAppointmentData] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const navigate = useNavigate();
    // 🔹 Estados para datos cargados del backend
    const [specialties, setSpecialties] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 Cargar especialidades al iniciar
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resEsp = await api.get("/api/cita/especialidades");
                setSpecialties(resEsp.data);
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar especialidades:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Paso 1: Seleccionar especialidad
    const handleSpecialtySelect = async (specialty) => {
        setSelectedSpecialty(specialty);
        setLoading(true);

        try {
            // 🔹 Obtener doctores según la especialidad
            const res = await api.get(
                `/api/cita/especialidades/${specialty.idEspecialidad}/doctores`
            );
            setDoctors(res.data);
            setStep(2);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar doctores:", error);
            setDoctors([]);
            setLoading(false);
        }
    };

    // Paso 2: Seleccionar doctor
    const handleDoctorSelect = async (doctor) => {
        setSelectedDoctor(doctor);
        setLoading(true);

        try {
            // 🔹 Obtener fechas disponibles para el doctor
            const res = await api.get(`/api/cita/doctores/${doctor.idDoctor}/fechas-disponibles`);

            // Las fechas vienen en formato YYYY-MM-DD como strings
            const fechasDisponibles = res.data;

            // Convertir strings a objetos Date para el calendario
            const fechasDate = fechasDisponibles.map(fechaStr => {
                const [year, month, day] = fechaStr.split('-').map(Number);
                return new Date(year, month - 1, day); // month - 1 porque Date usa 0-index para meses
            });

            setAvailableDates(fechasDate);
            setStep(3);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener fechas del doctor:", error);
            setAvailableDates([]);
            setLoading(false);
        }
    };

    // Función para verificar si una fecha está disponible
    const isDateAvailable = (date) => {
        if (!date || availableDates.length === 0) return false;

        const fechaString = date.format("YYYY-MM-DD");
        return availableDates.some(fecha =>
            fecha.toISOString().split('T')[0] === fechaString
        );
    };

    // Manejar selección de fecha
    const handleDateSelect = (date) => {
        if (isDateAvailable(date)) {
            setSelectedDate(date);
        }
    };

    // 🔹 useEffect para traer horarios disponibles cuando cambie la fecha seleccionada
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchAvailableHours = async () => {
                setLoading(true);
                try {
                    const res = await api.get(
                        `/api/cita/doctores/${selectedDoctor.idDoctor}/horarios/disponibles`,
                        {
                            params: { fecha: selectedDate.format("YYYY-MM-DD") },
                        }
                    );

                    const horarios = res.data; // ["08:00", "08:30", "09:00"]
                    setAvailableTimes(horarios);

                    // Verificar si hay horarios disponibles
                    if (horarios.length === 0) {
                        alert(
                            "No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha."
                        );
                        setSelectedDate(null);
                    } else {
                        // Avanzar al paso 4 para seleccionar hora
                        setStep(4);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Error al obtener horarios disponibles:", error);
                    setAvailableTimes([]);
                    alert("Error al cargar horarios. Por favor intenta de nuevo.");
                    setSelectedDate(null);
                    setLoading(false);
                }
            };

            fetchAvailableHours();
        }
    }, [selectedDoctor, selectedDate]);

    // Paso 4: Seleccionar hora
    const handleTimeSelect = (time) => {
        setSelectedTime(time);

        // Preparar datos de la cita para mostrar en el paso 5
        const appointmentSummary = {
            patientName: user?.nombreCompleto || pacienteData?.nombre || "Paciente",
            patientEmail: user?.email || "No especificado",
            specialty: selectedSpecialty.nombre,
            doctor: selectedDoctor.nombreCompleto,
            consultorio: selectedDoctor.consultorio,
            date: selectedDate.format("DD/MM/YYYY"),
            day: selectedDate.format("dddd"),
            time: time
        };

        setAppointmentData(appointmentSummary);
        setStep(5);
    };

    // Paso 5: Confirmar cita
    const handleConfirmAppointment = async () => {
        if (!appointmentData || !selectedDate || !selectedTime) return;

        setLoading(true);
        try {
            // Construir DTO para el backend
            const registroCita = {
                idDoctor: selectedDoctor.idDoctor,
                fechaCita: dayjs(
                    `${selectedDate.format("YYYY-MM-DD")}T${selectedTime}:00`
                ).format("YYYY-MM-DDTHH:mm:ss"),
            };

            // Llamada POST al backend
            const res = await api.post("/api/cita/registrar", registroCita);

            // Respuesta del backend
            const nuevaCita = res.data;
            console.log("Cita registrada:", nuevaCita);

            alert("¡Cita agendada exitosamente!");

            // Limpiar estados
            setStep(1);
            setSelectedSpecialty("");
            setSelectedDoctor(null);
            setSelectedDate(null);
            setSelectedTime("");
            setAppointmentData(null);
            setAvailableDates([]);
            setAvailableTimes([]);

            if (onAddAppointment) onAddAppointment(nuevaCita);
            navigate("/home");

        } catch (err) {
            console.error("Error registrando cita:", err);
            if (err.response?.status === 400 || err.response?.status === 409) {
                alert("No se pudo agendar la cita. Verifique que no tenga una cita pendiente con este doctor.");
            } else {
                alert("Error al registrar la cita. Por favor intente de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Función para retroceder
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);

            // Limpiar estados según el paso actual
            if (step === 5) {
                setAppointmentData(null);
                setSelectedTime("");
            } else if (step === 4) {
                setSelectedTime("");
                setAvailableTimes([]);
                setSelectedDate(null);
            } else if (step === 3) {
                setSelectedDate(null);
                setAvailableDates([]);
            } else if (step === 2) {
                setSelectedDoctor(null);
                setDoctors([]);
            }
        }
    };

    return (
        <div className="agendas-container">
            <div className="agendas-card">
                <h2>Agendar Cita Médica</h2>

                {/* Indicador de progreso */}
                <div className="progress-bar">
                    {[1, 2, 3, 4, 5].map((stepNum) => (
                        <div
                            key={stepNum}
                            className={`progress-step ${step >= stepNum ? "active" : ""}`}
                        >
                            {stepNum}
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Cargando...</p>
                    </div>
                )}

                {/* Paso 1: Seleccionar Especialidad */}
                {step === 1 && (
                    <div className="step-container">
                        <h3>Selecciona una especialidad</h3>
                        <div className="specialties-grid">
                            {specialties.map((specialty) => (
                                <button
                                    key={specialty.idEspecialidad}
                                    className="specialty-card"
                                    onClick={() => handleSpecialtySelect(specialty)}
                                    disabled={loading}
                                >
                  <span className="specialty-icon">
                    {/* Puedes usar un ícono basado en la especialidad */}
                      {specialty.nombre.charAt(0)}
                  </span>
                                    <span className="specialty-name">
                    {specialty.nombre}
                  </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Paso 2: Seleccionar Doctor */}
                {step === 2 && (
                    <div className="step-container">
                        <h3>
                            Selecciona un doctor de {selectedSpecialty.nombre}
                        </h3>
                        <div className="doctors-list">
                            {doctors.map((doctor) => (
                                <button
                                    key={doctor.idDoctor}
                                    className="doctor-card"
                                    onClick={() => handleDoctorSelect(doctor)}
                                    disabled={loading}
                                >
                                    <div className="doctor-info">
                    <span className="doctor-name">
                      {doctor.nombreCompleto}
                    </span>
                                        <span className="doctor-specialty">
                      Especialidad: {doctor.especialidad}
                    </span>
                                        <span className="doctor-availability">
                      Consultorio: {doctor.consultorio}
                    </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button className="back-button" onClick={handleBack} disabled={loading}>
                            ← Volver
                        </button>
                    </div>
                )}

                {/* Paso 3: Seleccionar Fecha */}
                {step === 3 && (
                    <div className="step-container">
                        <h3>
                            Selecciona una fecha para tu cita con {selectedDoctor?.nombreCompleto}
                        </h3>
                        <div className="calendar-container">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    disablePast
                                    shouldDisableDate={(date) => !isDateAvailable(date)}
                                    onChange={handleDateSelect}
                                    disabled={loading}
                                />
                            </LocalizationProvider>
                        </div>
                        <p className="info-text">
                            Solo se muestran las fechas disponibles para este doctor en los próximos 3 meses.
                        </p>
                        <button className="back-button" onClick={handleBack} disabled={loading}>
                            ← Volver
                        </button>
                    </div>
                )}

                {/* Paso 4: Seleccionar Hora */}
                {step === 4 && (
                    <div className="step-container">
                        <h3>
                            Selecciona un horario para el {selectedDate?.format("DD/MM/YYYY")}
                        </h3>
                        <div className="time-slots-grid">
                            {availableTimes.map((time) => (
                                <button
                                    key={time}
                                    className="time-slot"
                                    onClick={() => handleTimeSelect(time)}
                                    disabled={loading}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        {availableTimes.length === 0 && !loading && (
                            <p className="no-times-message">
                                No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha.
                            </p>
                        )}
                        <button className="back-button" onClick={handleBack} disabled={loading}>
                            ← Volver
                        </button>
                    </div>
                )}

                {/* Paso 5: Confirmar Cita */}
                {step === 5 && appointmentData && (
                    <div className="step-container">
                        <h3>Confirma tu cita</h3>
                        <div className="appointment-summary">
                            <div className="summary-item">
                                <strong>Paciente:</strong> {appointmentData.patientName}
                            </div>
                            <div className="summary-item">
                                <strong>Email:</strong> {appointmentData.patientEmail}
                            </div>
                            <div className="summary-item">
                                <strong>Especialidad:</strong> {appointmentData.specialty}
                            </div>
                            <div className="summary-item">
                                <strong>Doctor:</strong> {appointmentData.doctor}
                            </div>
                            <div className="summary-item">
                                <strong>Consultorio:</strong> {appointmentData.consultorio}
                            </div>
                            <div className="summary-item">
                                <strong>Fecha:</strong> {appointmentData.date} (
                                {appointmentData.day})
                            </div>
                            <div className="summary-item">
                                <strong>Hora:</strong> {appointmentData.time}
                            </div>
                            <div className="summary-item">
                                <strong>Hospital:</strong> Hospital San Judas Tadeo
                            </div>
                        </div>

                        <div className="confirmation-buttons">
                            <button
                                className="confirm-button"
                                onClick={handleConfirmAppointment}
                                disabled={loading}
                            >
                                {loading ? "Procesando..." : "✅ Confirmar Cita"}
                            </button>
                            <button className="back-button" onClick={handleBack} disabled={loading}>
                                ← Modificar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}