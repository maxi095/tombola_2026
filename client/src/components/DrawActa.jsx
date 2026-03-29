import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.locale("es");

function DrawActa({ draw }) {
  return (
    <div style={{ 
      padding: "160px 60px 60px 60px", // Margen superior mayor para membrete
      fontFamily: "Courier New, monospace", // Fuente tipo máquina de escribir
      color: "#000", 
      fontSize: "12px",
      lineHeight: "1.4"
    }}>
      
      {/* Título centrado */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ 
          fontSize: "16px", 
          fontWeight: "bold", 
          textDecoration: "underline",
          letterSpacing: "2px"
        }}>
          DECLARACIÓN JURADA
        </h1>
      </div>

      {/* Texto del acta */}
      <div style={{ textAlign: "justify", marginBottom: "10px" }}> {/* Cambié de 30px a 10px */}
        <p style={{ marginBottom: "10px" }}>
          Lotería de la Provincia de Córdoba S.E.
        </p>
        <p style={{ marginBottom: "10px" }}>
          S________________/________________D
        </p>
        <p style={{ marginBottom: "10px" }}>
          En la localidad de <strong>LAGUNA LARGA</strong>, a los <strong>{dayjs.utc(draw.drawDate).format("DD")}</strong> días del mes de 
          <strong> {dayjs.utc(draw.drawDate).format("MMMM")} de {dayjs.utc(draw.drawDate).format("YYYY")}</strong>
          , el CLUB ATLÉTICO Y BIBLIOTECA NEWELL´S OLD BOYS DE LAGUNA LARGA, 
          representado en este acto por el Sr. <strong>GUSTAVO FRANCISCO FERRARIO</strong>, 
          D.N.I. Nº 22,301,030, presidente respectivamente, en función 
          de su cargo y a los fines de dar cumplimiento a lo exigido por 
          vosotros, manifestamos en carácter de declaración jurada que en la 
          fecha de <strong>{dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}</strong>, el resultado de los sorteos realizados 
          de la <strong>"GRAN TOMBOLA MILLONARIA LAGUNENSE {draw.edition?.name?.toUpperCase() || "GRAN TÓMBOLA"}"</strong> que se detallan a continuación:
        </p>
        <p style={{ textAlign: "center", marginTop: "0px", marginBottom: "5px" }}> {/* Cambié el strong por p con menos márgenes */}
          <strong>{draw.description}</strong>
        </p>
      </div>

      {/* Lista de ganadores simplificada */}
      <div style={{ marginBottom: "20px", marginTop: "5px" }}> {/* Agregué marginTop: "10px" */}
        {draw.prizes && draw.prizes.length > 0 && draw.prizes.map((prize, index) => {
          const premioTexto = 
            prize.position === 1 ? "PRIMER PREMIO:" :
            prize.position === 2 ? "SEGUNDO PREMIO:" :
            prize.position === 3 ? "TERCER PREMIO:" :
            prize.position === 4 ? "CUARTO PREMIO:" :
            prize.position === 5 ? "QUINTO PREMIO:" :
            prize.position === 6 ? "SEXTO PREMIO:" :
            `PREMIO ${prize.position}°:`;

          return (
            <div key={index} style={{ marginBottom: "15px" }}>
              <p style={{ marginBottom: "0px" }}>
                <strong>{premioTexto}</strong> {prize.description || ""}
              </p>
              <p style={{ paddingLeft: "20px" }}>
                GANADOR: SOLICITUD NRO.: <strong>{prize.bingoCard?.number || "___"}</strong>
                {" "}{" "}{" "}{" "}
                {prize.sale?.client?.person
                  ? `${prize.sale.client.person.lastName?.toUpperCase()}, ${prize.sale.client.person.firstName?.toUpperCase()}`
                  : "PENDIENTE"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Espacio antes del texto de cierre */}
    <div style={{ marginTop: "30px" }}></div>


      {/* Texto de cierre */}
      <div style={{ marginBottom: "60px" }}>
        <p style={{ marginBottom: "10px" }}>ADJUNTAMOS A LA PRESENTE:</p>
        <p style={{ marginBottom: "5px" }}>
          FOTOCOPIA DEL ACTA DE LA ESCRIBANA FISCALIZADORA FRIZZO, MARIA INES
        </p>
        <p style={{ marginBottom: "5px" }}>
          COPIA DE CONSTANCIA DE ENTREGA DE PREMIOS DEL SORTEO DEL DIA: {dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}
        </p>
        <p style={{ marginTop: "10px" }}>
          Sin otro particular aprovechamos la ocasión para saludarlos muy atentamente.-
        </p>
      </div>
    </div>
  );
}

export default DrawActa;