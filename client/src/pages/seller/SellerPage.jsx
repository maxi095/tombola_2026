import { useEffect, useState, useMemo } from "react";
import { useSellers } from "../../context/SellerContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Plus,
  Search,
  MapPin,
  Phone,
  CreditCard,
  Edit3,
  FileSpreadsheet,
  Settings2,
  ChevronDown,
  Eye,
  Percent,
  CircleDollarSign,
  Loader2
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  UserCell,
  OperationCell
} from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ColumnPicker from "../../components/ui/ColumnPicker";
import { useTableColumns } from "../../hooks/useTableColumns";
import { formatDocument } from "../../libs/formatters";
import { exportToExcel } from "../../libs/excelExport";
import { useFeedback } from "../../context/FeedbackContext";

/**
 * SellerPage V10.0 - Elite Audit 2026 🛡️
 * Gestión administrativa de vendedores con infraestructura de alta fidelidad.
 */
function SellerPage() {
  const { getSellers, sellers, loading: contextLoading } = useSellers();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useFeedback();

  // CONFIGURACIÓN DE COLUMNAS v10.5 🛡️
  const initialColumns = [
    { id: 'sellerNumber', label: 'Nro Vendedor', isMandatory: true },
    { id: 'identity', label: 'Nombre', isMandatory: true },
    { id: 'document', label: 'Documento' },
    { id: 'location', label: 'Localidad' },
    { id: 'contact', label: 'Contacto' },
    { id: 'commission', label: 'Comisión', isMandatory: true },
    { id: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }
  ];

  const { columns, visibleColumns, toggleVisibility, moveColumn, resetColumns } = useTableColumns("SellersPage_v1", initialColumns);

  // ESTADO DE FILTROS (OMNISEARCH)
  const [omniSearch, setOmniSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (user) getSellers();
  }, [user, getSellers]);

  // Lógica de Filtrado Omnicanal 🏹
  const filteredSellers = useMemo(() => {
    if (!omniSearch.trim()) return sellers;

    const terms = omniSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);

    return sellers.filter(seller => {
      const sellerNum = String(seller.sellerNumber);
      const fullName = `${seller.person?.firstName} ${seller.person?.lastName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const dni = String(seller.person?.document);
      const city = (seller.person?.city || "").toLowerCase();

      return terms.every(term =>
        sellerNum.includes(term) ||
        fullName.includes(term) ||
        dni.includes(term) ||
        city.includes(term)
      );
    });
  }, [sellers, omniSearch]);

  useEffect(() => {
    const filters = [];
    if (omniSearch) filters.push({ id: 'omni', label: `Búsqueda: ${omniSearch}`, type: 'search' });
    setActiveFilters(filters);
  }, [omniSearch]);

  const handleRemoveFilter = () => setOmniSearch("");
  const handleClearFilters = () => setOmniSearch("");

  const handleExport = () => {
    const columnMap = {
      "sellerNumber": "Nro Vendedor",
      "person.lastName": "Apellido",
      "person.firstName": "Nombre",
      "person.document": "Documento",
      "person.city": "Localidad",
      "person.phone": "Teléfono",
      "person.email": "Email",
      "commissionRate": "Comisión (%)"
    };

    exportToExcel(filteredSellers, "Listado_Vendedores_Tombola", columnMap);
    showToast("Listado exportado correctamente", "success");
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Gestión de Vendedores"
        compact={true}
        icon={User}
        actions={[
          {
            label: "Exportar",
            icon: FileSpreadsheet,
            variant: "ghost",
            onClick: handleExport
          },
          {
            label: "Crear Vendedor",
            icon: Plus,
            onClick: () => navigate("/seller/new")
          }
        ]}
      />

      <div className="pb-10 flex-1 flex flex-col min-h-0">
        <Card padding="p-0" className="flex-1 flex flex-col min-h-0 shadow-sm border-slate-200/60 overflow-visible bg-white">

          <div className="flex items-center justify-between border-b border-slate-100/60 elite-audit-bar px-6">
            <div className="flex-1 min-h-[32px]">
              <FilterBar
                variant="slim"
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearFilters={handleClearFilters}
                title="Panel de filtros"
              >
                <div className="flex-1 min-w-[320px]">
                  <InputField
                    placeholder="Buscar por nombre, N° vendedor, DNI o localidad..."
                    icon={Search}
                    value={omniSearch}
                    onChange={(e) => setOmniSearch(e.target.value)}
                    className="!space-y-0 shadow-none border-transparent focus-within:border-primary/20"
                  />
                </div>
              </FilterBar>
            </div>

            <div className="relative shrink-0 flex items-center pr-4 border-l border-slate-100/60 h-8 ml-4">
              <button
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all active:scale-95 group ${isPickerOpen ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/40'}`}
              >
                <Settings2 size={13} className={isPickerOpen ? 'animate-spin-slow' : 'opacity-60'} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Personalizar Columnas</span>
                <ChevronDown size={11} className={`opacity-40 transition-transform ${isPickerOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
              </button>

              <div className="absolute right-0 top-11 z-[100]">
                <ColumnPicker
                  columns={columns}
                  isOpen={isPickerOpen}
                  onClose={() => setIsPickerOpen(false)}
                  toggleVisibility={toggleVisibility}
                  moveColumn={moveColumn}
                  resetColumns={resetColumns}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto relative min-h-[400px]">
            {contextLoading && sellers.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-sm">No se encontraron vendedores</p>
                <button onClick={handleClearFilters} className="text-primary text-xs mt-2 hover:underline">Limpiar búsqueda</button>
              </div>
            ) : (
              <Table className="overflow-hidden">
                <THead>
                  {visibleColumns.map(col => (
                    <TH key={col.id} className={col.id === 'actions' ? 'text-right px-10' : ''}>{col.label}</TH>
                  ))}
                </THead>
                <TBody>
                  {filteredSellers.map((seller) => (
                    <TR key={seller._id} className="group transition-all duration-300">
                      {visibleColumns.map(col => {
                        if (col.id === 'sellerNumber') return <OperationCell key={col.id} number={seller.sellerNumber} />;

                        if (col.id === 'identity') return (
                          <UserCell
                            key={col.id}
                            name={`${seller.person?.lastName}, ${seller.person?.firstName}`}
                            variant="primary"
                          />
                        );

                        if (col.id === 'document') return (
                          <TD key={col.id}>
                            <div className="flex items-center gap-2 text-slate-500">
                              <CreditCard size={12} className="opacity-40" />
                              <span className="text-xs font-black tracking-tight">{formatDocument(seller.person?.document) || "---"}</span>
                            </div>
                          </TD>
                        );

                        if (col.id === 'location') return (
                          <TD key={col.id}>
                            <div className="flex items-center gap-2 text-slate-500">
                              <MapPin size={12} className="opacity-40" />
                              <span className="text-xs font-bold truncate max-w-[150px]">{seller.person?.city || "S/L"}</span>
                            </div>
                          </TD>
                        );

                        if (col.id === 'contact') return (
                          <TD key={col.id}>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 text-primary font-black text-[11px] tracking-tight">
                                <Phone size={11} className="opacity-50" />
                                {seller.person?.phone || "S/T"}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold truncate max-w-[150px] lowercase pl-4">{seller.person?.email || "Sin email"}</div>
                            </div>
                          </TD>
                        );

                        if (col.id === 'commission') return (
                          <TD key={col.id}>
                            <Badge
                              variant="primary"
                              className="font-manrope font-black px-3"
                            >
                              {seller.commissionRate}%
                            </Badge>
                          </TD>
                        );

                        if (col.id === 'actions') return (
                          <TD key={col.id} className="text-right px-10 bg-slate-50/10">
                            <div className="flex justify-end gap-3 transition-all">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/seller/view/${seller._id}`)}
                                icon={Eye}
                              >
                                Ver
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/seller/edit/${seller._id}`)}
                                icon={Edit3}
                              >
                                Editar
                              </Button>
                            </div>
                          </TD>
                        );
                        return <TD key={col.id}>—</TD>;
                      })}
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SellerPage;
