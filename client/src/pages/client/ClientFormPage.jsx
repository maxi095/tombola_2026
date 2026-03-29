import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClients } from "../../context/ClientContext";

function ClientFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { createClient, updateClient, getClient, clientErrors } = useClients();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      getClient(params.id)
        .then((client) => {
          if (client) {
            setValue("firstName", client.person.firstName);
            setValue("lastName", client.person.lastName);
            setValue("document", client.person.document);
            setValue("email", client.person.email);
            setValue("address", client.person.address);
            setValue("city", client.person.city);
            setValue("phone", client.person.phone);
            setValue("notes", client.notes);
          }
        })
        .catch((err) => console.error("Error al cargar asociado:", err));
    }
  }, [params.id]);

  const onSubmit = handleSubmit(async (data) => {
    const clientData = {
      notes: data.notes || "",
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
        await updateClient(params.id, clientData);
      } else {
        await createClient(clientData);
      }
      navigate("/clients");
    } catch (error) {
      console.error("Error al enviar formulario:", error);
    }
  });

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <h2 className="title">{params.id ? "Editar Asociado" : "Nuevo Asociado"}</h2>

        {clientErrors &&
          clientErrors.map((err, i) => (
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
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
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
            <label className="label">Notas</label>
            <textarea
              {...register("notes")}
              className="form-input"
              placeholder="Notas internas"
            />
          </div>

          <button type="submit" className="btn-primary mt-4">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClientFormPage;
