import { useEffect, useState } from "react";
import { useSales } from "../../context/SaleContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

import { useEditionFilter } from "../../context/EditionFilterContext";

function SalePage() {
  const { getSales, sales, cancelSale } = useSales();
  const { user } = useAuth();
  const { selectedEdition } = useEditionFilter();

  const [filters, setFilters] = useState({
    saleNumber: "",
    clientName: "",
    clientCity:"",
    status: "",
    date: ""
  });

  const [filteredSales, setFilteredSales] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchSales = async () => {
        try {
          await getSales();
        } catch (error) {
          console.error("Error fetching sales:", error);
        }
      };
      fetchSales();
    }
  }, [getSales, user]);

  useEffect(() => {
    let temp = sales;

    // ② Filtro global de edición
    if (selectedEdition) {
      temp = temp.filter(sale =>
        sale.edition?._id === selectedEdition
      );
    }

    // ③ Filtros locales
    if (filters.saleNumber) {
      temp = temp.filter(sale =>
        sale.saleNumber?.toString().includes(filters.saleNumber)
      );
    }

    if (filters.clientName) {
      // Función para normalizar: quita tildes y pasa a minúsculas
      const normalizeText = (text) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      // Palabras a buscar, ya normalizadas
      const terms = normalizeText(filters.clientName).split(/\s+/);

      temp = temp.filter((sale) => {
        const client = sale.client;
        if (!client?.person) return false;

        // Nombre completo normalizado
        const fullName = normalizeText(
          `${client.person.firstName} ${client.person.lastName}`
        );

        // Verifica que todas las palabras del filtro estén en el nombre completo
        return terms.every((term) => fullName.includes(term));
      });
    }

    if (filters.clientCity) {

      // Función para normalizar: quita tildes y pasa a minúsculas
      const normalizeText = (text) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      // Palabras a buscar, ya normalizadas
      const terms = normalizeText(filters.clientCity).split(/\s+/);

      temp = temp.filter((sale) => {
        const client = sale.client;
        if (!client?.person?.city) return false;

        // Nombre completo normalizado
        const cityName = normalizeText(
          `${client.person.city}`
        );

        // Verifica que todas las palabras del filtro estén en el nombre completo
        return terms.every((term) => cityName.includes(term));
      });
    }

    if (filters.status === "") {
      temp = temp.filter(sale =>
        sale.status === "Pagado" || sale.status === "Pendiente de pago" || sale.status === "Entregado sin cargo"
      );
    } else {
      temp = temp.filter(sale =>
        sale.status === filters.status
      );
    }

    if (filters.date) {
      temp = temp.filter(sale => {
        const formatted = dayjs.utc(sale.saleDate).format("YYYY-MM-DD");
        return formatted === filters.date;
      });
    }

    setFilteredSales(temp);
  }, [sales, filters, selectedEdition]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      saleNumber: "",
      status: "",
      date: ""
    });
  };

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm("¿Estás seguro de que deseas anular esta venta?");
    if (confirmCancel) {
      try {
        await cancelSale(id);
        await getSales();
      } catch (error) {
        console.error("Error cancelando la venta:", error);
      }
    }
  };

  return (
    <div className="page-wide">
      <div className="header-bar">
        <h1 className="title">Ventas</h1>
        <Link to="/sale/new" className="btn-primary">
          Crear venta
        </Link>
      </div>

      {/* Filtros */}
      <div className="filters mb-4 mt-2 mr-2 ml-2">
        <input
          className="form-input"
          type="text"
          name="saleNumber"
          placeholder="Filtrar por número de venta"
          value={filters.saleNumber}
          onChange={handleFilterChange}
        />  
        <input
          className="form-input"
          type="text"
          name="clientName"
          placeholder="Nombre asociado"
          value={filters.clientName}
          onChange={handleFilterChange}
        />
        <input
          className="form-input"
          type="text"
          name="clientCity"
          placeholder="Localidad asociado"
          value={filters.clientCity}
          onChange={handleFilterChange}
        />
        <select
          className="form-input mt-1 mb-3"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">Todos</option>
          <option value="Pagado">Pagado</option>
          <option value="Entregado sin cargo">Entregado sin cargo</option>
          <option value="Pendiente de pago">Pendiente de pago</option>
          <option value="Anulada">Anulada</option>
        </select>
        <input
          className="form-input"
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
        
        <button className="btn-primary mb-4 mt-2 mr-2 ml-2" onClick={handleClearFilters}>
          Limpiar Filtros
        </button>
      </div>

      {(!filteredSales || filteredSales.length === 0) ? (
        <p className="empty-state">No hay ventas registradas.</p>
      ) : (
        <>
          {/* Contador de registros */}
          <div className="record-count">
            Mostrando <strong>{filteredSales.length}</strong> ventas
          </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Número de Venta</th>
                <th className="table-cell">Edición</th>
                <th className="table-cell">N° cartón</th>
                <th className="table-cell">Vendedor</th>
                <th className="table-cell">Asociado</th>
                <th className="table-cell">Teléfono asociado</th>
                <th className="table-cell">Localidad</th>
                <th className="table-cell">Estado</th>
                <th className="table-cell">Fecha de Venta</th>
                <th className="table-cell">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="table-row">
                  <td className="table-cell">{sale.saleNumber || "Sin número"}</td>
                  <td className="table-cell">{sale.edition?.name || "Sin edición"}</td>
                  <td className="table-cell">{sale.bingoCard?.number || "Sin cartón"}</td>
                  <td className="table-cell">
                    {sale.seller?.person?.firstName || "Sin"} {sale.seller?.person?.lastName || ""}
                  </td>
                  <td className="table-cell">
                     {sale.client?.person?.lastName || ""} {sale.client?.person?.firstName || "Sin"}
                  </td>
                   <td className="table-cell">{sale.client?.person?.phone || "Sin teléfono"}</td>
                  <td className="table-cell">{sale.client?.person?.city || "Sin localidad"}</td>
                  <td className="table-cell">
                    <span
                      className={`status-label ${
                        sale.status === "Anulada" ? "status-anulada" : 
                        sale.status === "Pendiente de pago" ? "status-pendiente" : 
                        sale.status === "Pagado" ? "status-confirmada" : "status-sin-cargo"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {dayjs.utc(sale.saleDate).format('DD/MM/YYYY') || "N/A"}
                  </td>
                  <td className="table-cell">
                    {sale.status !== "Anulada" && (
                      <div className="btn-group">
                        <Link
                          to={`/sale/view/${sale._id}`}
                          className="btn-secondary mr-2 flex items-center gap-1"
                        >
                        Ver
                        </Link>
                        <button
                          onClick={() => handleCancel(sale._id)}
                          className="btn-cancel flex items-center gap-1"
                        >
                        Anular
                        </button>
                      </div>
                    )}
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

export default SalePage;
