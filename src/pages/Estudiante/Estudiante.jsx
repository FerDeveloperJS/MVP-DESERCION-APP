import React, { useEffect, useState } from "react";
import "./Estudiante.css";

import { supabase } from "../../supabaseClient.js";

const Estudiante = () => {
  const [estudiante, setEstudiante] = useState(null);
  const [encuestasPendientes, setEncuestasPendientes] = useState([]);
  const [encuestasRespondidas, setEncuestasRespondidas] = useState([]);
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // OBTENER ESTUDIANTE + ENCUESTAS
  useEffect(() => {
    const cargarDatos = async () => {
      // 1. USUARIO AUTENTICADO
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError) {
        console.error("Error de autenticación:", authError);
        return;
      }
      const user = authData.user;

      // 2. BUSCAR ESTUDIANTE
      const { data: estudianteData, error: estudianteError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (estudianteError) {
        console.error("Error al buscar estudiante:", estudianteError);
        return;
      }
      setEstudiante(estudianteData);

      // 3. OBTENER ENCUESTAS ACTIVAS
      const { data: encuestasData, error: encuestasError } = await supabase
        .from("encuestas")
        .select("*")
        .eq("activa", true); // Filtramos directamente desde la query de Supabase

      if (encuestasError) {
        console.error("Error al obtener encuestas:", encuestasError);
        return;
      }

      // 4. OBTENER LAS ENCUESTAS QUE EL ESTUDIANTE YA RESPONDIÓ
      // (Buscamos en la tabla respuestas_encuesta qué IDs de encuesta ya hizo)
      const { data: respuestasData, error: respuestasError } = await supabase
        .from("respuestas_encuesta")
        .select("encuesta_id")
        .eq("estudiante_id", user.id);

      if (respuestasError) {
        console.error("Error al obtener respuestas:", respuestasError);
        return;
      }

      // Creamos un array con los IDs de las encuestas ya respondidas por el alumno
      const idsEncuestasRespondidas = respuestasData.map((r) => r.encuesta_id);

      // 5. OBTENER TODAS LAS PREGUNTAS (Para validar si tienen preguntas antes de mostrar)
      const { data: preguntasData, error: preguntasError } = await supabase
        .from("preguntas")
        .select("*");

      if (preguntasError) {
        console.error("Error al obtener preguntas:", preguntasError);
        return;
      }

      // 6. SEPARAR ENCUESTAS PENDIENTES Y RESPONDIDAS
      const pendientes = [];
      const respondidas = [];

      encuestasData.forEach((encuesta) => {
        const preguntasEncuesta = preguntasData.filter(
          (p) => p.encuesta_id === encuesta.id,
        );

        // Si la encuesta está vacía en el administrador, no se la mostramos al alumno
        if (preguntasEncuesta.length === 0) return;

        // Comprobamos si el ID de esta encuesta ya figura en sus respuestas de cabecera
        if (idsEncuestasRespondidas.includes(encuesta.id)) {
          respondidas.push(encuesta);
        } else {
          pendientes.push(encuesta);
        }
      });

      setEncuestasPendientes(pendientes);
      setEncuestasRespondidas(respondidas);
    };

    cargarDatos();
  }, []);

  // ABRIR ENCUESTA
  const abrirEncuesta = async (encuesta) => {
    setEncuestaSeleccionada(encuesta);

    const { data, error } = await supabase
      .from("preguntas")
      .select("*")
      .eq("encuesta_id", encuesta.id)
      .order("orden");

    if (error) {
      console.error("Error al abrir preguntas:", error);
      return;
    }

    setPreguntas(data);
  };

  // CAMBIAR RESPUESTA
  const handleRespuesta = (preguntaId, value) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: value,
    });
  };

  // ENVIAR RESPUESTAS (Lógica Maestro-Detalle corregida)
  const enviarEncuesta = async (e) => {
    e.preventDefault();

    // PASO A: Insertar la cabecera en 'respuestas_encuesta'
    const { data: cabeceraData, error: cabeceraError } = await supabase
      .from("respuestas_encuesta")
      .insert([
        {
          encuesta_id: encuestaSeleccionada.id,
          estudiante_id: estudiante.id,
        },
      ])
      .select()
      .single();

    if (cabeceraError) {
      console.error("Error al crear cabecera de respuesta:", cabeceraError);
      alert("Error iniciando el envío de la encuesta");
      return;
    }

    // PASO B: Preparar el detalle con el ID que nos devolvió la cabecera
    const respuestasDetalleInsert = preguntas.map((pregunta) => ({
      respuesta_encuesta_id: cabeceraData.id, // ID relacional de la cabecera
      pregunta_id: pregunta.id,
      respuesta: respuestas[pregunta.id] || "", // Si está vacío manda texto vacío
    }));

    // PASO C: Insertar los detalles en 'respuestas_detalle'
    const { error: detalleError } = await supabase
      .from("respuestas_detalle")
      .insert(respuestasDetalleInsert);

    if (detalleError) {
      console.error(
        "Error al insertar el detalle de respuestas:",
        detalleError,
      );
      alert("Error guardando las respuestas detalladas");
      return;
    }

    alert("Encuesta respondida correctamente 🎉");
    window.location.reload();
  };

  return (
    <div className="student-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <div className="logo-circle">S</div>
            <div>
              <h2>SIEP</h2>
              <p>Estudiante</p>
            </div>
          </div>
          <nav className="menu">
            <button className="menu-item active">
              <span>📋</span> Mis encuestas
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="logout-btn">Cerrar sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>Mis Encuestas</h1>
            <p>
              Responde las encuestas asignadas para evaluar tu bienestar
              académico.
            </p>
          </div>
          <div className="student-profile">
            <div className="profile-avatar">
              {estudiante?.nombre_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4>{estudiante?.nombre_completo}</h4>
            </div>
          </div>
        </header>

        {/* MODAL ENCUESTA */}
        {encuestaSeleccionada && (
          <section className="survey-modal">
            <div className="survey-form-card">
              <h2>{encuestaSeleccionada.titulo}</h2>
              <form onSubmit={enviarEncuesta}>
                {preguntas.map((pregunta, index) => (
                  <div key={pregunta.id} className="input-group">
                    <label>
                      {index + 1}. {pregunta.pregunta}
                    </label>
                    <input
                      type="text"
                      placeholder="Tu respuesta..."
                      value={respuestas[pregunta.id] || ""}
                      onChange={(e) =>
                        handleRespuesta(pregunta.id, e.target.value)
                      }
                    />
                  </div>
                ))}
                <div
                  className="modal-actions"
                  style={{ marginTop: "20px", display: "flex", gap: "10px" }}
                >
                  <button type="submit">Enviar encuesta</button>
                  <button
                    type="button"
                    onClick={() => setEncuestaSeleccionada(null)}
                    style={{ backgroundColor: "#dc3545" }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ENCUESTAS PENDIENTES */}
        <section className="surveys-section">
          <h2 className="section-title">Encuestas Pendientes</h2>
          {encuestasPendientes.length === 0 ? (
            <p>No tienes encuestas pendientes.</p>
          ) : (
            encuestasPendientes.map((encuesta) => (
              <div className="survey-card" key={encuesta.id}>
                <h3>{encuesta.titulo}</h3>
                <p>
                  Responde esta encuesta para monitorear tu bienestar académico.
                </p>
                <div className="survey-info">
                  <span>
                    📅 Disponible hasta{" "}
                    {new Date(encuesta.fecha_fin).toLocaleDateString()}
                  </span>
                </div>
                <button onClick={() => abrirEncuesta(encuesta)}>
                  Responder encuesta
                </button>
              </div>
            ))
          )}
        </section>

        {/* ENCUESTAS RESPONDIDAS */}
        <section className="surveys-section">
          <h2 className="section-title">Encuestas Respondidas</h2>
          {encuestasRespondidas.length === 0 ? (
            <p>No has respondido encuestas aún.</p>
          ) : (
            encuestasRespondidas.map((encuesta) => (
              <div className="survey-card" key={encuesta.id}>
                <h3>{encuesta.titulo}</h3>
                <p>Encuesta completada correctamente.</p>
                <div className="survey-info">
                  <span>✅ Respondida</span>
                </div>
                <button
                  disabled
                  style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}
                >
                  Respondida
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Estudiante;
