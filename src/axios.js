import axios from "axios";

// Crear instancia de Axios
const api = axios.create({
    baseURL: "http://localhost:8080", // Perfecto, sin /api o /auth
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para agregar token a CADA request PROTEGIDO
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // asumiendo que guardas el JWT

    // 🔽--- ¡AJUSTE IMPORTANTE AQUÍ! ---🔽
    //
    // Solo añadimos el token si la URL de la petición comienza con "/api"
    // y si el token existe.
    // De esta forma, las llamadas a "/auth/login" o "/ping" no llevarán
    // el header de autorización, que es lo correcto.
    //
    if (token && config.url.startsWith("/api")) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // 🔼--- FIN DEL AJUSTE ---🔼

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores globales (esto está bien)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.error("Acceso denegado: token inválido o permisos insuficientes");
            // Opcional: Aquí podrías redirigir al login si el token falla
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;