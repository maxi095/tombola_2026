import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSellers } from "../../context/SellerContext";

function SellerFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { createSeller, updateSeller, getSeller, sellerErrors } = useSellers();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      getSeller(params.id)
        .then((seller) => {
          if (seller) {
            setValue("firstName", seller.person.firstName);
            setValue("lastName", seller.person.lastName);
            setValue("document", seller.person.document);
            setValue("email", seller.person.email);
            setValue("address", seller.person.address);
            setValue("city", seller.person.city);
            setValue("phone", seller.person.phone);
            setValue("commissionRate", seller.commissionRate);
          }
        })
        .catch((err) => console.error("Error al cargar el vendedor:", err));
    }
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    const sellerData = {
      status: data.status || "Activo",
      commissionRate: data.commissionRate,
      person: {
        firstName: data.firstName,
        lastName: data.lastName,
        document: data.document,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
      },
    };

    try {
      if (params.id) {
        await updateSeller(params.id, sellerData);
      } else {
        await createSeller(sellerData);
      }
      navigate("/sellers");
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    }
  });

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <h2 className="title">{params.id ? "Editar Vendedor" : "Nuevo Vendedor"}</h2>

        {sellerErrors &&
          sellerErrors.map((err, i) => (
            <div key={i} className="form-error">
              {err}
            </div>
          ))}

        <form onSubmit={onSubmit} className="form-grid">
          <div className="form-section">
            <label className="label">Nombre</label>
            <input
              type="text"
              {...register("firstName", { required: "El nombre es requerido" })}
              className="form-input"
              placeholder="Nombre"
            />
            {errors.firstName && (
              <p className="form-error">{errors.firstName.message}</p>
            )}
          </div>

          <div className="form-section">
            <label className="label">Apellido</label>
            <input
              type="text"
              {...register("lastName", { required: "El apellido es requerido" })}
              className="form-input"
              placeholder="Apellido"
            />
            {errors.lastName && (
              <p className="form-error">{errors.lastName.message}</p>
            )}
          </div>

          <div className="form-section">
            <label className="label">N° Documento</label>
            <input
              type="text"
              {...register("document", { required: "El N° documento es requerido" })}
              className="form-input"
              placeholder="N° documento"
            />
            {errors.document && (
              <p className="form-error">{errors.document.message}</p>
            )}
          </div>

          <div className="form-section">
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              className="form-input"
              placeholder="Correo electrónico"
            />
          </div>

          <div className="form-section">
            <label className="label">Dirección</label>
            <input
              type="text"
              {...register("address")}
              className="form-input"
              placeholder="Dirección"
            />
          </div>

          <div className="form-section">
            <label className="label">Localidad</label>
            <input
              type="text"
              {...register("city")}
              className="form-input"
              placeholder="Localidad"
            />
          </div>

          <div className="form-section">
            <label className="label">Teléfono</label>
            <input
              type="text"
              {...register("phone")}
              className="form-input"
              placeholder="Teléfono"
            />
          </div>

          <div className="form-section">
            <label className="label">Porcentaje de Comisión (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              {...register("commissionRate", {
                required: "El porcentaje de comisión es requerido",
                min: { value: 0, message: "Debe ser al menos 0%" },
                max: { value: 100, message: "No puede superar el 100%" },
              })}
              className="form-input"
              placeholder="Ej: 10 para 10%"
            />
            {errors.commissionRate && (
              <p className="form-error">{errors.commissionRate.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary mt-4">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

export default SellerFormPage;
