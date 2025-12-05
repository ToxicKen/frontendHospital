// Datos iniciales de especialidades y doctores
export const initialAgendasData = {
  specialties: [
    { id: 1, name: 'Medicina General', icon: '🏥' },
    { id: 2, name: 'Pediatría', icon: '👶' },
    { id: 3, name: 'Ginecología', icon: '🌸' },
    { id: 4, name: 'Cardiología', icon: '❤️' },
    { id: 5, name: 'Dermatología', icon: '🔬' },
    { id: 6, name: 'Ortopedia', icon: '🦴' }
  ],
  doctors: [
    { 
      id: 1, 
      name: 'Dr. Juan Pérez', 
      specialty: 'Medicina General', 
      availableDays: ['Lunes', 'Miércoles', 'Viernes'],
      email: 'juan.perez@hospital.com'
    },
    { 
      id: 2, 
      name: 'Dra. María García', 
      specialty: 'Pediatría', 
      availableDays: ['Martes', 'Jueves'],
      email: 'maria.garcia@hospital.com'
    },
    { 
      id: 3, 
      name: 'Dr. Carlos López', 
      specialty: 'Cardiología', 
      availableDays: ['Lunes', 'Miércoles'],
      email: 'carlos.lopez@hospital.com'
    },
    { 
      id: 4, 
      name: 'Dra. Ana Martínez', 
      specialty: 'Ginecología', 
      availableDays: ['Martes', 'Jueves', 'Viernes'],
      email: 'ana.martinez@hospital.com'
    }
  ],
  timeSlots: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ],
  appointments: [] // Aquí se guardarán las citas agendadas
};

// Funciones para manejar localStorage
export const AgendasStorage = {
  // Obtener todos los datos de agendas
  getAgendasData: () => {
    const stored = localStorage.getItem('agendasData');
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Si no existe, inicializar con datos por defecto
      localStorage.setItem('agendasData', JSON.stringify(initialAgendasData));
      return initialAgendasData;
    }
  },

  // Guardar todos los datos de agendas
  setAgendasData: (data) => {
    localStorage.setItem('agendasData', JSON.stringify(data));
  },

  // Agregar una nueva cita
  addAppointment: (appointment) => {
    const data = AgendasStorage.getAgendasData();
    const newAppointment = {
      id: Date.now(), // ID único basado en timestamp
      ...appointment,
      status: 'confirmada',
      createdAt: new Date().toISOString()
    };
    
    data.appointments.push(newAppointment);
    AgendasStorage.setAgendasData(data);
    return newAppointment;
  },

  // Obtener todas las citas
  getAppointments: () => {
    const data = AgendasStorage.getAgendasData();
    return data.appointments;
  },

  // Obtener citas por paciente (email)
  getAppointmentsByPatient: (patientEmail) => {
    const data = AgendasStorage.getAgendasData();
    return data.appointments.filter(apt => apt.patientEmail === patientEmail);
  },

  // Obtener especialidades
  getSpecialties: () => {
    const data = AgendasStorage.getAgendasData();
    return data.specialties;
  },

  // Obtener doctores
  getDoctors: () => {
    const data = AgendasStorage.getAgendasData();
    return data.doctors;
  },

  // Obtener horarios
  getTimeSlots: () => {
    const data = AgendasStorage.getAgendasData();
    return data.timeSlots;
  },

  // Limpiar todos los datos (útil para desarrollo)
  clearData: () => {
    localStorage.setItem('agendasData', JSON.stringify(initialAgendasData));
  }
};