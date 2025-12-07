import React, { useState, useEffect } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./Agendas.css";
//import api from './axios.js';
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
  const [diasDisponibles, setDiasDisponibles] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  // Corregido: Faltaba punto y coma y el nombre se usa abajo
  const [availableTimes, setAvailableTimes] = useState([]);
  const navigate = useNavigate();
  // 🔹 Estados para datos cargados del backend
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // 🔹 Cargar especialidades al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resEsp = await api.get("/api/especialidades");
        setSpecialties(resEsp.data);
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
      }
    };
    fetchData();
  }, []);

  // Paso 1: Seleccionar especialidad
  const handleSpecialtySelect = async (specialty) => {
    setSelectedSpecialty(specialty);

    try {
      // 🔹 Obtener doctores según la especialidad (DTO)
      const res = await api.get(
        `/api/especialidades/${specialty.idEspecialidad}/doctores`
      );
      setDoctors(res.data);
      setStep(2);
    } catch (error) {
      console.error("Error al cargar doctores:", error);
      setDoctors([]);
    }
  };


  // Paso 2: Seleccionar doctor
  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);

    try {
      const res = await api.get(`/api/doctores/${doctor.id}/dias`);

      // Obtener los días que trabaja el doctor (ej: [1, 3, 5] para lunes, miércoles, viernes)
      const diasTrabajoDoctor = res.data;

      // Generar todas las fechas disponibles en los próximos 3 meses
      const hoy = new Date();
      const fechaMinima = new Date(hoy);
      fechaMinima.setHours(hoy.getHours() + 48); // 48 horas desde ahora

      const fechaMaxima = new Date(hoy);
      fechaMaxima.setMonth(hoy.getMonth() + 3); // 3 meses desde ahora

      const fechasDisponibles = [];
      const fechaActual = new Date(fechaMinima); // Empezar desde fechaMinima (48 horas después)

      // Recorrer todos los días desde fechaMinima hasta fechaMaxima
      while (fechaActual <= fechaMaxima) {
        const diaSemana = fechaActual.getDay(); // 0=domingo, 1=lunes, etc.

        // Verificar si el doctor trabaja este día
        if (diasTrabajoDoctor.includes(diaSemana)) {
          fechasDisponibles.push(new Date(fechaActual));
        }

        // Avanzar al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      setDiasDisponibles(fechasDisponibles);
      setStep(3);
    } catch (error) {
      console.error("Error al obtener días del doctor:", error);
    }
  };

  // Paso 3: Seleccionar fecha
  // useEffect para traer horarios disponibles cada vez que cambien doctor o fecha
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchAvailableHours = async () => {
        try {
          const res = await api.get(
            `/api/doctores/${selectedDoctor.id}/horarios/disponibles`,
            {
              params: { fecha: selectedDate.format("YYYY-MM-DD") },
            }
          );

          const horarios = res.data; // ["08:00", "08:30", "09:00"]
          setAvailableTimes(horarios);

          // Verificar si hay horarios disponibles después de cargarlos
          if (horarios.length === 0) {
            alert(
              "No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha."
            );
            setSelectedDate(null); // Limpiar fecha seleccionada
            // Mantenerse en el paso 3
          } else {
            // Solo avanzar al paso 4 si hay horarios disponibles
            setStep(4);
          }
        } catch (error) {
          console.error("Error al obtener horarios disponibles:", error);
          setAvailableTimes([]);
          alert("Error al cargar horarios. Por favor intenta de nuevo.");
          setSelectedDate(null); // Limpiar fecha seleccionada
        }
      };

      console.log(
        "doctor id:",
        selectedDoctor?.id,
        "fecha:",
        selectedDate?.format("YYYY-MM-DD")
      );
      fetchAvailableHours();
    }
  }, [selectedDoctor, selectedDate]);

  // Paso 4: Seleccionar hora
  const handleConfirmAppointment = async () => {
    if (!appointmentData) return;

    try {
      // Construir DTO que espera tu backend
      const registroCita = {
        idPaciente: user.id, // asegúrate que 'user.id' sea el id numérico
        idDoctor: selectedDoctor.id,
        fechaHoraCita: dayjs(
          `${selectedDate.format("YYYY-MM-DD")}T${selectedTime}`
        ).format("YYYY-MM-DDTHH:mm:ss"),
      };

      // Llamada POST al backend
      const res = await api.post("/api/registrar/cita", registroCita);

      // Respuesta del backend
      const nuevaCita = res.data;
      console.log("Cita registrada:", nuevaCita);

      alert("¡Cita agendada exitosamente!");

      // Limpiar estados
      setStep(1);
      setSelectedSpecialty(null);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime("");
      setAppointmentData(null);

      if (onAddAppointment) onAddAppointment(nuevaCita);
      navigate("/home");
    } catch (err) {
      console.error("Error registrando cita:", err);
      alert("Usted ya tiene una cita con ese doctor");
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

        {/* Paso 1: Seleccionar Especialidad */}
        {step === 1 && (
          <div className="step-container">
            <h3>Selecciona una especialidad</h3>
            <div className="specialties-grid">
              {specialties.map((specialty) => (
                <button
                  key={specialty.id}
                  className="specialty-card"
                  onClick={() => handleSpecialtySelect(specialty)}
                >
                  <span className="specialty-icon">{specialty.icon}</span>
                  <span className="specialty-name">
                    {specialty.nombre || specialty.name}
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
              Selecciona un doctor de{" "}
              {selectedSpecialty.nombre || selectedSpecialty.name}
            </h3>
            <div className="doctors-list">
              {doctors.map((doctor, index) => (
                <button
                  key={index}
                  className="doctor-card"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="doctor-info">
                    <span className="doctor-name">
                      Dr. {doctor.nombre} {doctor.apellidoP} {doctor.apellidoM}
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
            <button className="back-button" onClick={handleBack}>
              ← Volver
            </button>
          </div>
        )}

        {/* Paso 3: Seleccionar Fecha */}
        {step === 3 && (
          <div className="step-container">
            <h3>
              Selecciona una fecha para tu cita con {selectedDoctor.nombre}{" "}
              {selectedDoctor.apellidoP}
            </h3>
            <div className="calendar-container">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  disablePast
                  shouldDisableDate={(date) => !isDateAvailable(date)}
                  onChange={handleDateSelect}
                />
              </LocalizationProvider>
            </div>
            <button className="back-button" onClick={handleBack}>
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
              {/* ¡ERROR CORREGIDO!
                              Aquí decía 'timeSlots.map', pero la variable
                              correcta en tu estado es 'availableTimes'.
                            */}
              {availableTimes.map((time) => (
                <button
                  key={time}
                  className="time-slot"
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </button>
              ))}
            </div>
            <button className="back-button" onClick={handleBack}>
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
              >
                ✅ Confirmar Cita
              </button>
              <button className="back-button" onClick={handleBack}>
                ← Modificar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
