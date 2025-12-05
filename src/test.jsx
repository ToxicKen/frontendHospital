import { useEffect } from "react";
import api from "./axios.js";

export default function TestConnection() {
    useEffect(() => {
        api.get("/ping")
            .then(res => console.log("Backend conectado:", res.data))
            .catch(err => console.error("No hay conexión al backend:", err));
    }, []);

    return <div>Verifica la consola para conexión backend</div>;
}