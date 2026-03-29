import { useEffect, useState } from "react";
import { useDraws } from "../../context/DrawContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { useEditionFilter } from "../../context/EditionFilterContext";

import ReactDOMServer from "react-dom/server";
import DrawActa from "../../components/DrawActa";
import DrawPrizeDelivery from "../../components/DrawPrizeDelivery";

dayjs.extend(utc);

function DrawPage() {
  const { getDraws, draws, deleteDraw } = useDraws();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();

  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  const [filteredDraws, setFilteredDraws] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchDraws = async () => {
        try {
          await getDraws();
        } catch (error) {
          console.error("Error fetching draws:", error);
        }
      };
      fetchDraws();
    }
  }, [user]);

  useEffect(() => {
    let temp = draws;

    // ② Filtro global de edición
    if (selectedEdition) {
      temp = temp.filter(sale =>
        sale.edition?._id === selectedEdition
      );
    }

    if (filters.type) {
      temp = temp.filter((draw) => draw.type === filters.type);
    }

    if (filters.status) {
      temp = temp.filter((draw) => draw.status === filters.status);
    }

    setFilteredDraws(temp);
  }, [draws, filters, selectedEdition]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      status: "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este sorteo?"
    );
    if (confirmDelete) {
      try {
        await deleteDraw(id);
        await getDraws();
      } catch (error) {
        console.error("Error eliminando sorteo:", error);
      }
    }
  };

  // Agregar esta función antes del return
const handleDownloadActa = async (draw) => {
  const html2pdf = (await import("html2pdf.js")).default;

  // Renderizar el acta principal
  const actaHtml = ReactDOMServer.renderToString(
    <DrawActa draw={draw} />
  );

  // Renderizar las hojas de entrega de premios (solo para premios con ganador)
  const prizesWithWinners = draw.prizes?.filter(p => p.bingoCard) || [];
  const deliveryPages = prizesWithWinners.map(prize => 
    ReactDOMServer.renderToString(
      <DrawPrizeDelivery draw={draw} prize={prize} />
    )
  ).join("");

  // Combinar todo el HTML
  const fullHtml = actaHtml + deliveryPages;

  const opt = {
    margin: 0.5,
    filename: `Acta_Sorteo_${draw.edition?.name || "sin-edicion"}_${draw.type}_${dayjs.utc(draw.drawDate).format("YYYY-MM-DD")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Para respetar los pageBreak
  };

  html2pdf().from(fullHtml).set(opt).save();
};

  return (
    <div className="page-wide">
      <div className="header-bar">
        <h1 className="title">Sorteos</h1>
        <Link to="/draw/new" className="btn-primary">
          Crear sorteo
        </Link>
      </div>

      {/* Filtros */}
      <div className="filters mb-4 mt-2 mr-2 ml-2">

        <select
          className="form-input mt-1 mb-3"
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="">Todos los tipos</option>
          <option value="Mensual">Mensual</option>
          <option value="Final">Final</option>
        </select>

        <select
          className="form-input mt-1 mb-3"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">Todos los estados</option>
          <option value="Programado">Programado</option>
          <option value="En curso">En curso</option>
          <option value="Finalizado">Finalizado</option>
        </select>

        <button
          className="btn-primary mb-4 mt-2 mr-2 ml-2"
          onClick={handleClearFilters}
        >
          Limpiar Filtros
        </button>
      </div>

      {!filteredDraws || filteredDraws.length === 0 ? (
        <p className="empty-state">No hay sorteos registrados.</p>
      ) : (
        <>
          {/* Contador de registros */}
          <div className="record-count">
            Mostrando <strong>{filteredDraws.length}</strong> sorteos
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Edición</th>
                  <th className="table-cell">Tipo</th>
                  <th className="table-cell">Fecha de Sorteo</th>
                  <th className="table-cell">Nombre del sorteo</th>
                  <th className="table-cell">Premios</th>
                  <th className="table-cell">Estado</th>
                  <th className="table-cell">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDraws.map((draw) => (
                  <tr key={draw._id} className="table-row">
                    <td className="table-cell">
                      {draw.edition?.name || "Sin edición"}
                    </td>
                    <td className="table-cell">{draw.type}</td>
                    <td className="table-cell">
                      {dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}
                    </td>
                    <td className="table-cell">
                      {draw.description || "Sin descripción"}
                    </td>
                    <td className="table-cell">{draw.prizes?.length || 0}</td>
                    <td className="table-cell">
                      <span
                        className={`status-label ${
                          draw.status === "Finalizado"
                            ? "status-confirmada"
                            : draw.status === "En curso"
                            ? "status-pendiente"
                            : "status-sin-cargo"
                        }`}
                      >
                        {draw.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleDownloadActa(draw)}
                        className="text-blue-600 underline mr-2 mb-2"
                      >
                        Descargar acta
                      </button>
                      <div className="btn-group">
                        <Link
                          to={`/draw/view/${draw._id}`}
                          className="btn-secondary mr-2 flex items-center gap-1"
                        >
                          Ver
                        </Link>
                        {draw.status === "Programado" && (
                          <>
                            <Link
                              to={`/draw/edit/${draw._id}`}
                              className="btn-view mr-2 flex items-center gap-1"
                            >
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDelete(draw._id)}
                              className="btn-cancel flex items-center gap-1"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default DrawPage;