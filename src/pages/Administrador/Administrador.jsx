import React, { useEffect, useState } from "react";
import "./Administrador.css";

import { supabase } from "../../supabaseClient.js";

const Administrador = () => {
  const [admin, setAdmin] = useState(null);

  // ENCUESTA
  const [titulo, setTitulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // PREGUNTAS
  const [preguntas, setPreguntas] = useState(["", "", "", "", "", ""]);

  // OBTENER ADMIN
  useEffect(() => {
    const obtenerAdmin = async () => {
      // USUARIO AUTENTICADO
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.log(authError);
        return;
      }

      const user = authData.user;

      // BUSCAR ADMIN
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setAdmin(data);
    };

    obtenerAdmin();
  }, []);

  // CAMBIAR PREGUNTAS
  const handlePreguntaChange = (index, value) => {
    const nuevasPreguntas = [...preguntas];

    nuevasPreguntas[index] = value;

    setPreguntas(nuevasPreguntas);
  };

  // CREAR ENCUESTA
  const crearEncuesta = async (e) => {
    e.preventDefault();

    // VALIDACIONES
    if (!titulo.trim()) {
      alert("Debes ingresar un título");
      return;
    }

    if (!fechaInicio || !fechaFin) {
      alert("Debes seleccionar las fechas");
      return;
    }

    // CREAR ENCUESTA
    const { data: encuestaData, error: encuestaError } = await supabase
      .from("encuestas")
      .insert([
        {
          titulo: titulo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          creada_por: admin.id,
        },
      ])
      .select()
      .single();

    if (encuestaError) {
      console.log(encuestaError);
      alert("Error creando encuesta");
      return;
    }

    // FILTRAR PREGUNTAS VACIAS
    const preguntasValidas = preguntas.filter(
      (pregunta) => pregunta.trim() !== "",
    );

    // VALIDAR QUE HAYA AL MENOS UNA PREGUNTA
    if (preguntasValidas.length === 0) {
      alert("Debes agregar al menos una pregunta");
      return;
    }

    // PREPARAR PREGUNTAS
    const preguntasInsert = preguntasValidas.map((pregunta, index) => ({
      encuesta_id: encuestaData.id,
      pregunta: pregunta,
      orden: index + 1,
    }));

    // INSERTAR PREGUNTAS
    const { error: preguntasError } = await supabase
      .from("preguntas")
      .insert(preguntasInsert);

    if (preguntasError) {
      console.log(preguntasError);
      alert("Error guardando preguntas");
      return;
    }

    alert("Encuesta creada correctamente");

    // LIMPIAR FORMULARIO
    setTitulo("");
    setFechaInicio("");
    setFechaFin("");

    setPreguntas(["", "", "", "", "", ""]);
  };

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* LOGO */}
          <div className="logo">
            <div className="logo-circle">S</div>

            <div>
              <h2>SIEP</h2>
              <p>Administrador</p>
            </div>
          </div>

          {/* MENU */}
          <nav className="menu">
            <button className="menu-item active">
              <span>📝</span>
              Crear encuesta
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="sidebar-bottom">
          <button className="logout-btn">Cerrar sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1>Crear Encuesta</h1>

            <p>
              Diseña y publica encuestas periódicas para monitorear el estado
              estudiantil.
            </p>
          </div>

          {/* PERFIL ADMIN */}
          <div className="admin-profile">
            <div className="profile-avatar">
              {admin?.nombre_completo?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4>{admin?.nombre_completo}</h4>
            </div>
          </div>
        </header>

        {/* FORMULARIO */}
        <section className="survey-section">
          <div className="survey-card">
            <h2>Nueva Encuesta</h2>

            <form className="survey-form" onSubmit={crearEncuesta}>
              {/* TITULO */}
              <div className="input-group">
                <label>Título de la encuesta</label>

                <input
                  type="text"
                  placeholder="Ej: Encuesta de bienestar emocional"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              {/* FECHA INICIO */}
              <div className="input-group">
                <label>Fecha de inicio</label>

                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              {/* FECHA FIN */}
              <div className="input-group">
                <label>Fecha de finalización</label>

                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>

              {/* PREGUNTA 1 */}
              <div className="input-group">
                <label>Pregunta 1</label>

                <input
                  type="text"
                  placeholder="Escribe la pregunta 1"
                  value={preguntas[0]}
                  onChange={(e) => handlePreguntaChange(0, e.target.value)}
                />
              </div>

              {/* PREGUNTA 2 */}
              <div className="input-group">
                <label>Pregunta 2</label>

                <input
                  type="text"
                  placeholder="Escribe la pregunta 2"
                  value={preguntas[1]}
                  onChange={(e) => handlePreguntaChange(1, e.target.value)}
                />
              </div>

              {/* PREGUNTA 3 */}
              <div className="input-group">
                <label>Pregunta 3</label>

                <input
                  type="text"
                  placeholder="Escribe la pregunta 3"
                  value={preguntas[2]}
                  onChange={(e) => handlePreguntaChange(2, e.target.value)}
                />
              </div>

              {/* PREGUNTA 4 */}
              <div className="input-group">
                <label>Pregunta 4</label>

                <input
                  type="text"
                  placeholder="Escribe la pregunta 4"
                  value={preguntas[3]}
                  onChange={(e) => handlePreguntaChange(3, e.target.value)}
                />
              </div>

              {/* PREGUNTA 5 */}
              <div className="input-group">
                <label>Pregunta 5</label>

                <input
                  type="text"
                  placeholder="Escribe la pregunta 5"
                  value={preguntas[4]}
                  onChange={(e) => handlePreguntaChange(4, e.target.value)}
                />
              </div>

              {/* PREGUNTA 6 */}
              <div className="input-group">
                <label>Pregunta 6</label>

                <input
                  type="text"
                  placeholder="Escribe la pregunta 6"
                  value={preguntas[5]}
                  onChange={(e) => handlePreguntaChange(5, e.target.value)}
                />
              </div>

              <button type="submit" className="create-btn">
                Publicar encuesta
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Administrador;
