// SaleFormPage.jsx

import { useEffect, useState } from "react";
import { useForm, Controller, get } from "react-hook-form";
import Select from "react-select";
import { useNavigate, useParams, useLocation  } from "react-router-dom";

import { useSales } from "../../context/SaleContext";
import { useClients } from "../../context/ClientContext";
import { useSellers } from "../../context/SellerContext";
import { useBingoCards } from "../../context/BingoCardContext";
import { useEditions } from "../../context/EditionContext";

import ClientModal from "../../components/ClientModal";
import { customSelectStyles } from '../../styles/reactSelectStyles';
import dayjs from "dayjs";

function SaleFormPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm();

  const navigate = useNavigate();
  const params = useParams();

  const { createSale, updateSale, getSale } = useSales();
  const { clients = [], getClients } = useClients();
  const { sellers = [], getSellers } = useSellers();
  const { availableBingoCards = [], getAvailableBingoCards } = useBingoCards();
  const { editions = [], getEditions } = useEditions();
  const [selectedEditionId, setSelectedEditionId] = useState(null);
  
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedTab = searchParams.get("tab"); 
  const preselectedSellerId = searchParams.get("sellerId");

  const normalizeText = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const customFilterOption = (option, rawInput) => {
    const input = normalizeText(rawInput);
    const terms = input.split(/\s+/); // separa por espacios

    const label = normalizeText(option.label);

    // verifica que todas las palabras estén presentes en el label
    return terms.every(term => label.includes(term));
  };

  useEffect(() => {
  const initializeSaleForm = async () => {
    if (editions.length) {
      const newestEdition = editions[editions.length - 1];

      // Seteamos la edición más reciente en el formulario
      setValue("edition", {
        value: newestEdition._id,
        label: newestEdition.name,
      });

      setSelectedEditionId(newestEdition._id);

      // Cargamos las opciones de los selectores
      await Promise.all([
        getAvailableBingoCards(), // Si la función acepta un ID
        getClients(),
        getSellers(),
      ]);

      if (preselectedSellerId && sellers.length) {
        const seller = sellers.find((s) => s._id === preselectedSellerId);
        if (seller) {
          setValue("seller", {
            value: seller._id,
            label: `${seller.person.firstName} ${seller.person.lastName}`,
          });
        }
      }
    }
  };

  initializeSaleForm();
}, [editions, setValue, preselectedSellerId]);


  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      edition: data.edition.value,
      seller: data.seller.value,
      client: data.client.value,
      bingoCard: data.bingoCard.value,
      saleDate: data.saleDate, // campo nuevo
      status: "Pendiente de pago",
    };

    if (params.id) {
      await updateSale(params.id, payload);
    } else {
      await createSale(payload);
    }

    if (preselectedSellerId) {
      navigate(`/seller/view/${preselectedSellerId}?tab=${preselectedTab || "ventas"}`);
    } else {
      navigate("/sales");
    }
  });

  const handleClientCreated = async (newClient) => {
    await getClients();
    setValue("client", {
      value: newClient._id,
      label: `(${newClient.person.document}) ${newClient.person.firstName} ${newClient.person.lastName}`,
    });
  };

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <h2 className="title">
          {params.id ? "Editar Venta" : "Registrar Venta"}
        </h2>

        <form onSubmit={onSubmit} className="form-grid">
          <div className="form-section">
            <label className="label">Edición</label>
            <Controller
              name="edition"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  styles={customSelectStyles}
                  options={editions.map((e) => ({
                    value: e._id,
                    label: e.name,
                  }))}
                  onChange={(selected) => {
                    field.onChange(selected); // sigue funcionando el formulario
                    setSelectedEditionId(selected?.value); // guardamos edición seleccionada
                  }}
                />
              )}
            />
          </div>

          <div className="form-section">
            <label className="label">Vendedor</label>
            <Controller
              name="seller"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={!!preselectedSellerId} // ✅ Bloquear si vino seteado
                  styles={customSelectStyles}
                  options={sellers.map((s) => ({
                    value: s._id,
                    label: `${s.person.firstName} ${s.person.lastName}`,
                  }))}
                />
              )}
            />
          </div>

          <div className="form-section">
            <label className="label">Asociado</label>
            <div className="client-select-wrapper">
              <div className="select-container">
                <Controller
                  name="client"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      styles={customSelectStyles}
                      options={clients.map((c) => ({
                        value: c._id,
                        label: `(${c.person.document}) ${c.person.firstName} ${c.person.lastName}`,
                      }))}
                      filterOption={customFilterOption}
                    />
                  )}
                />
              </div>
              <button
                type="button"
                className="btn-secondary my-2"
                onClick={() => setIsClientModalOpen(true)}
              >
                + Asociado
              </button>
            </div>
          </div>

          <div className="form-section">
            <label className="label">Cartón de Bingo</label>
            <Controller
              name="bingoCard"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  styles={customSelectStyles}
                  options={availableBingoCards
                    .filter((b) =>
                      selectedEditionId ? b.edition._id === selectedEditionId : true
                    )
                    .map((b) => ({
                      value: b._id,
                      label: `Cartón #${b.number} Edición ${b.edition.name}`,
                      number: b.number, // lo usamos en el filtro
                    }))
                  }
                  filterOption={(option, inputValue) => {
                    // Compara solo contra el número y edición
                    const numberMatch = option.data.number?.toString().includes(inputValue);
                    return numberMatch;
                  }}
                />
              )}
            />
          </div>

          <div className="form-section">
            <label className="label">Fecha de Venta</label>
            <input
              type="date"
              {...register("saleDate", { required: true })}
              className="form-input"
              defaultValue={dayjs().format("YYYY-MM-DD")} // Usa dayjs si ya lo tenés en el proyecto
            />
          </div>

          <button type="submit" className="btn-primary mt-4">
            Guardar
          </button>
        </form>
      </div>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}

export default SaleFormPage;
