import { useEffect, useState } from "react";
import { useQuotas } from "../../context/QuotaContext";
import { Link } from "react-router-dom";
import dayjs from "dayjs";


function AllQuotasPage() {
    const { getQuotasFilter } = useQuotas();

  const [filters, setFilters] = useState({
    quotaNumber: "",
    updatedDate: ""
    });

const [appliedFilters, setAppliedFilters] = useState({});

const applyFilters = () => {
  setAppliedFilters(filters);
};

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    totalPages: 1,
    total: 0
  });

  const [localQuotas, setLocalQuotas] = useState([]);

useEffect(() => {
    const fetchQuotas = async () => {
        const res = await getQuotasFilter({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "updatedAt:desc",
        filters: appliedFilters
        });

        if (res && Array.isArray(res.quotas)) {
        setLocalQuotas(res.quotas);
        setPagination(prev => ({
            ...prev,
            total: res.total,
            totalPages: res.totalPages
        }));
        } else {
        setLocalQuotas([]);
        }
    };

    fetchQuotas();
    }, [pagination.page, pagination.limit, appliedFilters, getQuotasFilter]);

  const handlePageChange = (delta) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, prev.page + delta)
    }));
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(e.target.value),
      page: 1
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    const cleared = {
        quotaNumber: "",
        updatedDate: ""
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
    };
  


  return (
    <div className="page-wide">
      <div className="header-bar">
        <h1 className="title">Historial de actualización de cuotas</h1>
      </div>

      {/* Filtros */}
      <div className="filters mb-4 mt-2 mr-2 ml-2">
        <input
          className="form-input"
          type="number"
          name="quotaNumber"
          placeholder="Filtrar por N° de cuota"
          value={filters.quotaNumber}
          onChange={handleFilterChange}
        />

        <input
          className="form-input"
          type="date"
          name="updatedDate"
          value={filters.updatedDate}
          onChange={handleFilterChange}
        />

        <button className="btn-primary mb-4 mt-2 mr-2 ml-2" onClick={applyFilters}>
          Filtrar
        </button>
        <button className="btn-primary mb-4 mt-2 mr-2 ml-2" onClick={handleClearFilters}>
          Limpiar Filtros
        </button>
      </div>

      

      {localQuotas.length === 0 ? (
        <p className="empty-state ml-2">No se encontraron cuotas.</p>
      ) : (
        <>
        <div className="mb-2 mt-2 mr-2 ml-2 flex items-center justify-between">
            <div className="record-count">
                Mostrando <strong>{localQuotas.length}</strong> cuotas (página {pagination.page} de {pagination.totalPages})
            </div>

            <div className="flex items-center">
                <label htmlFor="limit" className="mr-2 whitespace-nowrap">Resultados por página:</label>
                <select id="limit" value={pagination.limit} onChange={handleLimitChange} className="form-input mb-0">
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                </select>
            </div>
        </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Edición</th>
                  <th className="table-cell">N° cartón</th>
                  <th className="table-cell">N° cuota</th>
                  <th className="table-cell">Vendedor</th>
                  <th className="table-cell">Asociado</th>
                  <th className="table-cell">Monto</th>
                  <th className="table-cell">Estado</th>
                  <th className="table-cell">Última modificación</th>
                  <th className="table-cell">Acción</th>
                </tr>
              </thead>
              <tbody>
                {localQuotas.map(quota => (
                  <tr key={quota._id} className="table-row">
                    <td className="table-cell">{quota.sale?.edition?.name || "Sin edición"}</td>
                    <td className="table-cell">{quota.sale?.bingoCard?.number}</td>
                    <td className="table-cell">{quota.quotaNumber}</td>
                    <td className="table-cell">{quota.sale?.seller?.person?.firstName} {quota.sale?.seller?.person?.lastName}</td>
                    <td className="table-cell">{quota.sale?.client?.person?.firstName} {quota.sale?.client?.person?.lastName}</td>
                    <td className="table-cell">${quota.amount?.toFixed(2)}</td>
                    <td className="table-cell">
                      <span className={`status-label ${quota.paymentDate ? "status-confirmada" : "status-pendiente"}`}>
                        {quota.paymentDate ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="table-cell">{dayjs(quota.updatedAt).format("DD/MM/YYYY HH:mm")}</td>
                    <td className="table-cell">
                        <div className="btn-group">
                          <Link
                            to={`/sale/view/${quota.sale?._id}`}
                            className="btn-secondary mr-2 flex items-center gap-1"
                          >
                            Ver venta
                          </Link>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navegación */}
          <div className="mt-4 flex justify-between ml-2 mr-2">
            <button
              className="btn-secondary"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(-1)}
            >
              Página anterior
            </button>
            <button
              className="btn-secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(1)}
            >
              Página siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AllQuotasPage;
