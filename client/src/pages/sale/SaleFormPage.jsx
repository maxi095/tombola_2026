import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  Ticket, 
  User as UserIcon, 
  Calendar, 
  Plus, 
  Save, 
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Info
} from "lucide-react";

import { useSales } from "../../context/SaleContext";
import { useClients } from "../../context/ClientContext";
import { useSellers } from "../../context/SellerContext";
import { useBingoCards } from "../../context/BingoCardContext";
import { useEditions } from "../../context/EditionContext";

import ClientModal from "../../components/ClientModal";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import Badge from "../../components/ui/Badge";
import EliteSelect from "../../components/ui/Select";
import { useFeedback } from "../../context/FeedbackContext";
import dayjs from "dayjs";

function SaleFormPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      saleDate: dayjs().format("YYYY-MM-DD")
    }
  });

  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useFeedback();

  const { createSale, updateSale, getSale, loading: salesLoading } = useSales();
  const { clients = [], getClients } = useClients();
  const { sellers = [], getSellers } = useSellers();
  const { availableBingoCards = [], getAvailableBingoCards } = useBingoCards();
  const { editions = [], getEditions } = useEditions();
  
  const [selectedEditionId, setSelectedEditionId] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedTab = searchParams.get("tab"); 
  const preselectedSellerId = searchParams.get("sellerId");

  const normalizeText = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const customFilterOption = (option, rawInput) => {
    const input = normalizeText(rawInput);
    const terms = input.split(/\s+/);
    const label = normalizeText(option.label);
    return terms.every(term => label.includes(term));
  };

  useEffect(() => {
    const initializeSaleForm = async () => {
      await Promise.all([
        getEditions(),
        getClients(),
        getSellers(),
        getAvailableBingoCards()
      ]);
    };
    initializeSaleForm();
  }, []);

  useEffect(() => {
    const loadFields = async () => {
      if (editions.length && !params.id) {
        const newestEdition = editions[editions.length - 1];
        setValue("edition", {
          value: newestEdition._id,
          label: newestEdition.name,
        });
        setSelectedEditionId(newestEdition._id);
      }

      if (preselectedSellerId && sellers.length) {
        const seller = sellers.find((s) => s._id === preselectedSellerId);
        if (seller) {
          setValue("seller", {
            value: seller._id,
            label: `${seller.person.firstName} ${seller.person.lastName}`,
          });
        }
      }
    };
    loadFields();
  }, [editions, sellers, preselectedSellerId, params.id, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    const payload = {
      edition: data.edition.value,
      seller: data.seller.value,
      client: data.client.value,
      bingoCard: data.bingoCard.value,
      saleDate: data.saleDate,
      status: "Pendiente de pago",
    };

    try {
      if (params.id) {
        await updateSale(params.id, payload);
        showToast("Venta actualizada correctamente", "success");
      } else {
        await createSale(payload);
        showToast("¡Venta registrada con éxito!", "success");
      }

      if (preselectedSellerId) {
        navigate(`/seller/view/${preselectedSellerId}?tab=${preselectedTab || "ventas"}`);
      } else {
        navigate("/sales");
      }
    } catch (error) {
      showToast("Error al procesar la operación", "danger");
    } finally {
      setSaving(false);
    }
  });

  const handleClientCreated = async (newClient) => {
    await getClients();
    setValue("client", {
      value: newClient._id,
      label: `${newClient.person.lastName} ${newClient.person.firstName} (${newClient.person.document})`,
    });
    showToast("Asociado registrado automáticamente", "success");
  };

  const handleBack = () => {
    if (preselectedSellerId) {
      navigate(`/seller/view/${preselectedSellerId}?tab=${preselectedTab || "ventas"}`);
    } else {
      navigate("/sales");
    }
  };

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700">
      <PageHeader
        title={params.id ? "Editar Venta" : "Registrar Venta"}
        subtitle="Sincronice los datos de la transacción para mantener la trazabilidad financiera del sorteo."
        breadcrumbs={[
          { label: "Ventas", href: "/sales" },
          { label: params.id ? "Editar" : "Registrar", href: "#" }
        ]}
        actions={[
          {
            label: "Volver",
            variant: "ghost",
            onClick: handleBack
          },
          {
            label: params.id ? "Guardar cambios" : "Guardar Venta",
            icon: Save,
            loading: saving || salesLoading,
            onClick: onSubmit
          }
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-8 pb-24">
        {/* SECCIÓN 1: CONFIGURACIÓN DE OPERACIÓN */}
        <Card title="Configuración de Venta" icon={Calendar} description="Detalles administrativos y temporales">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Edición Activa</label>
              <Controller
                name="edition"
                control={control}
                rules={{ required: "Campo obligatorio" }}
                render={({ field }) => (
                  <EliteSelect
                    {...field}
                    options={editions.map((e) => ({ value: e._id, label: e.name }))}
                    placeholder="Seleccionar..."
                    onChange={(selected) => {
                      field.onChange(selected);
                      setSelectedEditionId(selected?.value);
                      setValue("bingoCard", null);
                    }}
                  />
                )}
              />
              {errors.edition && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.edition.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Vendedor Responsable</label>
              <Controller
                name="seller"
                control={control}
                rules={{ required: "Campo obligatorio" }}
                render={({ field }) => (
                  <EliteSelect
                    {...field}
                    isDisabled={!!preselectedSellerId}
                    options={sellers.map((s) => ({
                      value: s._id,
                      label: `${s.person.lastName}, ${s.person.firstName}`,
                    }))}
                    placeholder="Buscar vendedor..."
                    filterOption={customFilterOption}
                  />
                )}
              />
              {errors.seller && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.seller.message}</p>}
            </div>

            <InputField
              label="Fecha de Operación"
              type="date"
              icon={Calendar}
              {...register("saleDate", { required: "Campo obligatorio" })}
              error={errors.saleDate?.message}
            />
          </div>
        </Card>

        {/* SECCIÓN 2: ASIGNACIÓN DE ASOCIADO Y CARTÓN */}
        <Card title="Asociado y Cartón" icon={Ticket} description="Identificación del comprador y número de juego">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Seleccionar Asociado</label>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 px-3 text-[10px] bg-slate-50 border-slate-100 hover:bg-primary hover:text-white rounded-lg transition-all"
                  onClick={() => setIsClientModalOpen(true)}
                  icon={Plus}
                >
                  Registrar Nuevo
                </Button>
              </div>
              <Controller
                name="client"
                control={control}
                rules={{ required: "El asociado es requerido" }}
                render={({ field }) => (
                  <EliteSelect
                    {...field}
                    options={clients.map((c) => ({
                      value: c._id,
                      label: `${c.person.lastName} ${c.person.firstName} (${c.person.document})`,
                    }))}
                    placeholder="Buscar por DNI o Apellido..."
                    filterOption={customFilterOption}
                    noOptionsMessage={() => "No se encontró el asociado"}
                  />
                )}
              />
              {errors.client && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.client.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 ml-1">Cartón de Bingo (#)</label>
              <Controller
                name="bingoCard"
                control={control}
                rules={{ required: "Se requiere un cartón" }}
                render={({ field }) => (
                  <EliteSelect
                    {...field}
                    options={availableBingoCards
                      .filter((b) => {
                        if (!selectedEditionId) return true;
                        return b.edition?._id === selectedEditionId;
                      })
                      .map((b) => ({
                        value: b._id,
                        label: `Cartón #${b.number} - ${b.edition?.name || 'S/D'}`,
                        number: b.number,
                      }))
                    }
                    placeholder={selectedEditionId ? "Buscar número..." : "Seleccioná edición primero"}
                    isDisabled={!selectedEditionId}
                    filterOption={(option, inputValue) => {
                      return option.data.number?.toString().includes(inputValue);
                    }}
                  />
                )}
              />
              {errors.bingoCard && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.bingoCard.message}</p>}
            </div>
          </div>

          <div className="mt-10 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 flex gap-4 items-start">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
              <Info size={20} />
            </div>
            <div className="flex flex-col gap-1">
               <p className="text-[11px] font-black uppercase text-indigo-400 tracking-widest">Información de Seguridad</p>
               <p className="text-[12px] font-bold text-slate-500 leading-relaxed tracking-tight">
                 La tómbola solo permite la asignación de cartones que no tengan una venta activa en la edición cursante. Ante cualquier duda, verifique el stock en el módulo de Cartones.
               </p>
            </div>
          </div>
        </Card>
      </form>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}

export default SaleFormPage;
