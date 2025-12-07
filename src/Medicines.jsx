import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Medicines.css";

export default function Medicines() {
  const navigate = useNavigate();
  const come = () => navigate("/Home");
  const [search, setSearch] = useState("");

  const medicamentos = [
    { nombre: "Paracetamol", stock: 120 },
    { nombre: "Omeprazol", stock: 40 },
    { nombre: "Ibuprofeno", stock: 75 },
    { nombre: "Amoxicilina", stock: 18 },
  ];

  const filtrados = medicamentos.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="med-container">
      <div className="med-header">
        <button className="btn-back" onClick={come}>
          ← Regresar
        </button>
        <h2>Consulta de Medicamentos</h2>
      </div>

      <input
        type="text"
        placeholder="Buscar medicamento"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="med-table">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Existencia</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((m, i) => (
            <tr key={i}>
              <td>{m.nombre}</td>
              <td className={m.stock === 0 ? "stock-zero" : "stock-ok"}>
                {m.stock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
