// src/data/agendasData.js

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
      status: 'pendiente_pago',
      paymentDue: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 horas para pagar
      createdAt: new Date().toISOString(),
      paidAt: null
    };
    
    data.appointments.push(newAppointment);
    AgendasStorage.setAgendasData(data);
    return newAppointment;
  },

  // Marcar cita como pagada
  markAsPaid: (appointmentId) => {
    const data = AgendasStorage.getAgendasData();
    const appointment = data.appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = 'confirmada';
      appointment.paidAt = new Date().toISOString();
      AgendasStorage.setAgendasData(data);
      return true;
    }
    return false;
  },

  // Cancelar cita por falta de pago
  cancelAppointment: (appointmentId) => {
    const data = AgendasStorage.getAgendasData();
    const appointment = data.appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = 'cancelada';
      AgendasStorage.setAgendasData(data);
      return true;
    }
    return false;
  },

  getAppointments: () => {
    const data = AgendasStorage.getAgendasData();
    return data.appointments;
  },

  getAppointmentsByPatient: (patientEmail) => {
    const data = AgendasStorage.getAgendasData();
    return data.appointments.filter(apt => apt.patientEmail === patientEmail);
  },

  // Obtener citas que están por vencer el pago
  getPendingPaymentAppointments: (patientEmail) => {
    const appointments = AgendasStorage.getAppointmentsByPatient(patientEmail);
    return appointments.filter(apt => 
      apt.status === 'pendiente_pago' && 
      new Date(apt.paymentDue) > new Date()
    );
  },

  // Obtener citas confirmadas (pagadas)
  getConfirmedAppointments: (patientEmail) => {
    const appointments = AgendasStorage.getAppointmentsByPatient(patientEmail);
    return appointments.filter(apt => apt.status === 'confirmada');
  },

  // Obtener citas canceladas
  getCancelledAppointments: (patientEmail) => {
    const appointments = AgendasStorage.getAppointmentsByPatient(patientEmail);
    return appointments.filter(apt => apt.status === 'cancelada');
  },

  // Limpiar todos los datos (útil para desarrollo)
  clearData: () => {
    localStorage.setItem('agendasData', JSON.stringify(initialAgendasData));
  }
};

// Función separada para verificar estado de pagos (no está dentro de AgendasStorage)
export const checkPaymentStatus = () => {
  const data = AgendasStorage.getAgendasData();
  const now = new Date();
  let updated = false;
  
  data.appointments.forEach(apt => {
    if (apt.status === 'pendiente_pago' && new Date(apt.paymentDue) <= now) {
      apt.status = 'cancelada';
      updated = true;
    }
  });
  
  if (updated) {
    AgendasStorage.setAgendasData(data);
  }
  
  return updated;
};