import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.locale("es");

function DrawPrizeDelivery({ draw, prize }) {
  const premioTexto = 
    prize.position === 1 ? "PRIMER PREMIO" :
    prize.position === 2 ? "SEGUNDO PREMIO" :
    prize.position === 3 ? "TERCER PREMIO" :
    prize.position === 4 ? "CUARTO PREMIO" :
    prize.position === 5 ? "QUINTO PREMIO" :
    `PREMIO ${prize.position}°`;

  return (
    <div style={{ 
      padding: "160px 60px 60px 60px",
      fontFamily: "Arial, sans-serif",
      color: "#000",
      fontSize: "14px",
      pageBreakBefore: "always"
    }}>
      
      {/* Título */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "40px",
        borderBottom: "3px solid #000",
        paddingBottom: "10px"
      }}>
        <h1 style={{ 
          fontSize: "30px", 
          fontWeight: "bold",
          fontStyle: "italic",
          margin: "0"
        }}>
          ENTREGA DE PREMIOS
        </h1>
      </div>

      {/* Nombre del ganador */}
      <div style={{ 
        border: "2px solid #000",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <p style={{ fontSize: "12px", margin: "0 0 15px 0" }}>
          SE ENTREGA AL SR.:
        </p>
        <p style={{ 
          fontSize: "18px", 
          fontWeight: "bold",
          fontStyle: "italic",
          margin: "0",
          textAlign: "center"
        }}>
          {prize.sale?.client?.person
            ? `${prize.sale.client.person.lastName?.toUpperCase()}, ${prize.sale.client.person.firstName?.toUpperCase()}`
            : "_______________________________________"}
        </p>
      </div>

      {/* Información del premio - SIN BORDES INTERNOS */}
      <div style={{ 
        border: "2px solid #000",
        marginBottom: "20px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr"
      }}>
        <div style={{ 
          padding: "20px",
          borderRight: "2px solid #000"
        }}>
          <p style={{ fontSize: "12px", margin: "0 0 10px 0" }}>
            GANADOR DEL:
          </p>
          <p style={{ 
            fontSize: "18px", 
            fontWeight: "bold",
            fontStyle: "italic",
            margin: "0"
          }}>
            {premioTexto}
          </p>
        </div>
        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: "12px", margin: "0 0 5px 0" }}>
            DEL:
          </p>
          <p style={{ 
            fontSize: "18px", 
            fontWeight: "bold",
            fontStyle: "italic",
            margin: "0 0 15px 0"
          }}>
            {draw.description}
          </p>
          <p style={{ fontSize: "12px", margin: "0" }}>
            DEL: <span style={{ fontSize: "18px", fontWeight: "bold", marginLeft: "20px" }}>
              {dayjs.utc(draw.drawDate).format("DD/MM/YYYY")}
            </span>
          </p>
        </div>
      </div>

      {/* Número de cartón */}
      <div style={{ 
        border: "2px solid #000",
        marginBottom: "20px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr"
      }}>
        <div style={{ 
          padding: "20px",
          borderRight: "2px solid #000"
        }}>
          <p style={{ fontSize: "12px", margin: "0" }}>
            CON EL CARTON NRO.:
          </p>
        </div>
        <div style={{ 
          padding: "20px",
          textAlign: "center"
        }}>
          <p style={{ 
            fontSize: "18px", 
            fontWeight: "bold",
            fontStyle: "italic",
            margin: "0"
          }}>
            {prize.bingoCard?.number?.toString().padStart(6, '0') || "______"}
          </p>
        </div>
      </div>

      {/* Monto del premio */}
      <div style={{ 
        border: "2px solid #000",
        marginBottom: "60px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr"
      }}>
        <div style={{ 
          padding: "20px",
          borderRight: "2px solid #000",
        }}>
          <p style={{ fontSize: "12px", margin: "0" }}>
            PREMIO:
          </p>
        </div>
        <div style={{ 
          padding: "20px",
          textAlign: "center"
        }}>
          <p style={{ 
            fontSize: "18px", 
            fontWeight: "bold",
            margin: "0"
          }}>
            {prize.description || "________________"}
          </p>
        </div>
      </div>

        {/* Texto RECIBÍ CONFORME */}
    <div style={{ 
        textAlign: "center",
        marginTop: "160px",
        borderTop: "2px dashed #000",
        paddingTop: "5px",
        width: "35%",  // Controla el ancho (50% de la página)
        marginLeft: "auto",
        marginRight: "auto"
        }}>
        <p style={{ 
            fontSize: "11px",
            fontWeight: "bold",
            margin: "0"
        }}>
            RECIBO CONFORME
        </p>
    </div>
</div>

  );
}

export default DrawPrizeDelivery;