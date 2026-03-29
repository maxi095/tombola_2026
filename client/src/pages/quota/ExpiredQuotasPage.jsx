import { useEffect, useState } from "react";
import { useQuotas } from "../../context/QuotaContext";
import QuotaPaymentModal from "../../components/QuotaPaymentModal";
import dayjs from "dayjs";

import { useEditionFilter } from "../../context/EditionFilterContext";

function ExpiredQuotasPage() {
  const { getExpiredQuotas, quotas, payQuota, updateQuota } = useQuotas();
  const { selectedEdition } = useEditionFilter();
  

  const [filters, setFilters] = useState({
    sellerName: "",
    clientName: "",
    dueDate: ""
  });

  const [filteredQuotas, setFilteredQuotas] = useState([]);
  const [selectedQuota, setSelectedQuota] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchExpired = async () => {
      try {
        await getExpiredQuotas(); // ya actualiza el context internamente
      } catch (error) {
        console.error("Error al obtener cuotas vencidas:", error);
      }
    };
    fetchExpired();
  }, [getExpiredQuotas]);

  useEffect(() => {
    let filtered = Array.isArray(quotas) ? quotas : [];

    if (selectedEdition) {
      filtered = filtered.filter(quota =>
        quota.sale?.edition?._id === selectedEdition
      );
    }

    if (filters.sellerName) {
      filtered = filtered.filter(quota => {
        const fullName = `${quota.sale?.seller?.person?.firstName || ""} ${quota.sale?.seller?.person?.lastName || ""}`.toLowerCase();
        return fullName.includes(filters.sellerName.toLowerCase());
      });
    }

    if (filters.clientName) {
      filtered = filtered.filter(quota => {
        const fullName = `${quota.sale?.client?.person?.firstName || ""} ${quota.sale?.client?.person?.lastName || ""}`.toLowerCase();
        return fullName.includes(filters.clientName.toLowerCase());
      });
    }

    if (filters.dueDate) {
      filtered = filtered.filter(quota =>
        dayjs(quota.dueDate).format("YYYY-MM-DD") === filters.dueDate
      );
    }

    setFilteredQuotas(filtered);
  }, [quotas, filters, selectedEdition]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      sellerName: "",
      clientName: "",
      dueDate: ""
    });
  };

  const openModal = (quota) => {
    if (isModalOpen) return; // evita doble apertura
    console.log("Abriendo modal para cuota:", quota);
    setSelectedQuota(quota);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuota(null);
  };

  const handleSaveQuota = async (updatedQuota) => {
    try {
      const result = await updateQuota(updatedQuota._id, updatedQuota);
      console.log("✅ Cuota actualizada:", result);
      await getExpiredQuotas(); // actualiza el context
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error al actualizar cuota:", error);
      alert("Hubo un error al actualizar la cuota.");
    }
  };

  return (
    <div className="page-wide">
      <div className="header-bar">
        <h1 className="title">Cuotas vencidas</h1>
      </div>

      {/* Filtros */}
      <div className="filters mb-2">
        <input
          className="form-input"
          type="text"
          name="sellerName"
          placeholder="Filtrar por vendedor"
          value={filters.sellerName}
          onChange={handleFilterChange}
        />
        <input
          className="form-input"
          type="text"
          name="clientName"
          placeholder="Filtrar por cliente"
          value={filters.clientName}
          onChange={handleFilterChange}
        />
        <input
          className="form-input"
          type="date"
          name="dueDate"
          value={filters.dueDate}
          onChange={handleFilterChange}
        />
        <button className="btn-primary mb-4 mt-2 ml-2" onClick={handleClearFilters}>
          Limpiar Filtros
        </button>
      </div>

      {filteredQuotas.length === 0 ? (
        <p className="empty-state">No hay cuotas vencidas actualmente.</p>
      ) : (
        <>
          {/* Contador de registros */}
          <div className="record-count">
            Mostrando <strong>{filteredQuotas.length}</strong> cuotas
          </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Edición</th>
                <th className="table-cell">N° cartón</th>
                <th className="table-cell">N° cuota</th>
                <th className="table-cell">Vendedor</th>
                <th className="table-cell">Cliente</th>
                <th className="table-cell">Monto</th>
                <th className="table-cell">Fecha de Vencimiento</th>
                <th className="table-cell">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotas.map((quota) => (
                <tr key={quota._id} className="table-row">
                  <td className="table-cell">{quota.sale?.edition?.name || "Sin edición"}</td>
                  <td className="table-cell">{quota.sale?.bingoCard?.number}</td>
                  <td className="table-cell">{quota.quotaNumber}</td>
                  <td className="table-cell">
                    {quota.sale?.seller?.person?.firstName || "Sin"}{" "}
                    {quota.sale?.seller?.person?.lastName || ""}
                  </td>
                  <td className="table-cell">
                    {quota.sale?.client?.person?.firstName || "Sin"}{" "}
                    {quota.sale?.client?.person?.lastName || ""}
                  </td>
                  <td className="table-cell">${quota.amount?.toFixed(2) || "0.00"}</td>
                  <td className="table-cell">
                    {dayjs.utc(quota.dueDate).format("DD/MM/YYYY")}
                  </td>
                  <td className="table-cell">
                    <button
                      className="btn-primary"
                      disabled={isModalOpen}
                      onClick={() => openModal(quota)}
                    >
                      Registrar pago
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      

      {/* Modal */}
      {selectedQuota && (
        <QuotaPaymentModal
          isOpen={isModalOpen}
          quota={selectedQuota}
          onClose={handleCloseModal}
          onSave={handleSaveQuota}
        />
      )}
    </div>
  );
}

export default ExpiredQuotasPage;
