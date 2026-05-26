import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import "./VerCurso.css";

/* ─────────────────────────────────────────────
   TAB: ESTUDIANTES
───────────────────────────────────────────── */
const TabEstudiantes = ({ estudiantes, cargando }) => {
  return (
    <>
      <div className="tab-header-actions">
        <h3>Estudiantes matriculados</h3>
      </div>

      <div className="tabla-wrapper">
        {cargando ? (
          <p className="estado-msg">Cargando estudiantes...</p>
        ) : estudiantes.length === 0 ? (
          <p className="sin-estudiantes">No hay estudiantes matriculados.</p>
        ) : (
          <table className="tabla-estudiantes">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Documento</th>
              </tr>
            </thead>

            <tbody>
              {estudiantes.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>

                  <td>{m.usuarios?.nombre_completo}</td>

                  <td>{m.usuarios?.email}</td>

                  <td>{m.usuarios?.numero_documento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   TAB: NOTAS
───────────────────────────────────────────── */
const TabNotas = ({ estudiantes }) => {
  const [promedios, setPromedios] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPromedios();
  }, []);

  const cargarPromedios = async () => {
    setCargando(true);

    try {
      const ids = estudiantes.map((e) => e.estudiante_id);

      const { data, error } = await supabase
        .from("notas")
        .select("estudiante_id, nota")
        .in("estudiante_id", ids);

      if (error) {
        console.error(error);
        setCargando(false);
        return;
      }

      const mapa = {};

      ids.forEach((id) => {
        const notasEst = data.filter((n) => n.estudiante_id === id);

        if (!notasEst.length) {
          mapa[id] = 0;
          return;
        }

        const suma = notasEst.reduce((acc, n) => acc + Number(n.nota), 0);

        mapa[id] = suma / notasEst.length;
      });

      setPromedios(mapa);
    } catch (err) {
      console.error(err);
    }

    setCargando(false);
  };

  return (
    <>
      <div className="tab-header-actions">
        <h3>Notas</h3>
      </div>

      <div className="tabla-wrapper">
        {cargando ? (
          <p className="estado-msg">Cargando notas...</p>
        ) : (
          <table className="tabla-estudiantes">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Promedio</th>
              </tr>
            </thead>

            <tbody>
              {estudiantes.map((m) => (
                <tr key={m.id}>
                  <td>{m.usuarios?.nombre_completo}</td>

                  <td>{(promedios[m.estudiante_id] || 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   TAB: ASISTENCIA
───────────────────────────────────────────── */
const TabAsistencia = ({ estudiantes }) => {
  const [porcentajes, setPorcentajes] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    setCargando(true);

    try {
      const ids = estudiantes.map((e) => e.estudiante_id);

      const { data, error } = await supabase
        .from("asistencias")
        .select("estudiante_id, estado")
        .in("estudiante_id", ids);

      if (error) {
        console.error(error);
        setCargando(false);
        return;
      }

      const mapa = {};

      ids.forEach((id) => {
        const asistenciasEst = data.filter((a) => a.estudiante_id === id);

        if (!asistenciasEst.length) {
          mapa[id] = 0;
          return;
        }

        const presentes = asistenciasEst.filter(
          (a) => a.estado === "presente",
        ).length;

        const porcentaje = (presentes / asistenciasEst.length) * 100;

        mapa[id] = porcentaje;
      });

      setPorcentajes(mapa);
    } catch (err) {
      console.error(err);
    }

    setCargando(false);
  };

  return (
    <>
      <div className="tab-header-actions">
        <h3>Asistencia</h3>
      </div>

      <div className="tabla-wrapper">
        {cargando ? (
          <p className="estado-msg">Cargando asistencia...</p>
        ) : (
          <table className="tabla-estudiantes">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Asistencia</th>
              </tr>
            </thead>

            <tbody>
              {estudiantes.map((m) => (
                <tr key={m.id}>
                  <td>{m.usuarios?.nombre_completo}</td>

                  <td>{Math.round(porcentajes[m.estudiante_id] || 0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   TAB: RIESGO
───────────────────────────────────────────── */
const TabRiesgo = ({ estudiantes }) => {
  const [promedios, setPromedios] = useState({});
  const [asistencias, setAsistencias] = useState({});
  const [cargando, setCargando] = useState(true);

  /* MODALES */
  const [modalEncuestas, setModalEncuestas] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  /* DATA */
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  const [encuestasRespondidas, setEncuestasRespondidas] = useState([]);

  const [detalleEncuesta, setDetalleEncuesta] = useState([]);

  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);

  const [cargandoEncuestas, setCargandoEncuestas] = useState(false);

  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    try {
      const ids = estudiantes.map((e) => e.estudiante_id);

      /* NOTAS */
      const { data: notasData } = await supabase
        .from("notas")
        .select("estudiante_id, nota")
        .in("estudiante_id", ids);

      const mapaProm = {};

      ids.forEach((id) => {
        const notasEst = notasData.filter((n) => n.estudiante_id === id);

        if (!notasEst.length) {
          mapaProm[id] = 0;
          return;
        }

        const suma = notasEst.reduce((acc, n) => acc + Number(n.nota), 0);

        mapaProm[id] = suma / notasEst.length;
      });

      setPromedios(mapaProm);

      /* ASISTENCIAS */
      const { data: asisData } = await supabase
        .from("asistencias")
        .select("estudiante_id, estado")
        .in("estudiante_id", ids);

      const mapaAsis = {};

      ids.forEach((id) => {
        const asistenciasEst = asisData.filter((a) => a.estudiante_id === id);

        if (!asistenciasEst.length) {
          mapaAsis[id] = 0;
          return;
        }

        const presentes = asistenciasEst.filter(
          (a) => a.estado === "presente",
        ).length;

        mapaAsis[id] = (presentes / asistenciasEst.length) * 100;
      });

      setAsistencias(mapaAsis);
    } catch (err) {
      console.error(err);
    }

    setCargando(false);
  };

  /* ─────────────────────────────
     ABRIR ENCUESTAS
  ───────────────────────────── */
  const abrirEncuestas = async (estudiante) => {
    setEstudianteSeleccionado(estudiante);

    setModalEncuestas(true);

    setCargandoEncuestas(true);

    try {
      const { data, error } = await supabase
        .from("respuestas_encuesta")
        .select(
          `
          id,
          fecha,
          encuesta_id,
          encuestas (
            id,
            titulo
          )
        `,
        )
        .eq("estudiante_id", estudiante.estudiante_id)
        .order("fecha", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setEncuestasRespondidas(data || []);
    } catch (err) {
      console.error(err);
    }

    setCargandoEncuestas(false);
  };

  /* ─────────────────────────────
     ABRIR DETALLE
  ───────────────────────────── */
  const abrirDetalleEncuesta = async (respuestaEncuesta) => {
    setEncuestaSeleccionada(respuestaEncuesta);

    setModalDetalle(true);

    setCargandoDetalle(true);

    try {
      const { data, error } = await supabase
        .from("respuestas_detalle")
        .select(
          `
          id,
          respuesta,
          preguntas (
            pregunta
          )
        `,
        )
        .eq("respuesta_encuesta_id", respuestaEncuesta.id);

      if (error) {
        console.error(error);
        return;
      }

      setDetalleEncuesta(data || []);
    } catch (err) {
      console.error(err);
    }

    setCargandoDetalle(false);
  };

  const cerrarEncuestas = () => {
    setModalEncuestas(false);

    setEncuestasRespondidas([]);

    setEstudianteSeleccionado(null);
  };

  const cerrarDetalle = () => {
    setModalDetalle(false);

    setDetalleEncuesta([]);

    setEncuestaSeleccionada(null);
  };

  const dataRiesgo = estudiantes.map((m) => {
    const promedio = promedios[m.estudiante_id] || 0;

    const asistencia = asistencias[m.estudiante_id] || 0;

    let riesgoNotas = 0;

    if (promedio >= 4) {
      riesgoNotas = 0;
    } else if (promedio >= 3) {
      riesgoNotas = 10;
    } else if (promedio >= 2) {
      riesgoNotas = 25;
    } else {
      riesgoNotas = 40;
    }

    let riesgoAsistencia = 0;

    if (asistencia >= 90) {
      riesgoAsistencia = 0;
    } else if (asistencia >= 75) {
      riesgoAsistencia = 10;
    } else if (asistencia >= 50) {
      riesgoAsistencia = 25;
    } else {
      riesgoAsistencia = 40;
    }

    const riesgoTotal = riesgoNotas + riesgoAsistencia;

    let nivel = "Bajo";

    if (riesgoTotal >= 60) {
      nivel = "Alto";
    } else if (riesgoTotal >= 30) {
      nivel = "Medio";
    }

    return {
      estudiante: m.usuarios?.nombre_completo,
      estudiante_id: m.estudiante_id,
      promedio: promedio.toFixed(1),
      asistencia: Math.round(asistencia),
      riesgo: riesgoTotal,
      nivel,
    };
  });

  const totalAltos = dataRiesgo.filter((e) => e.nivel === "Alto").length;

  const totalMedios = dataRiesgo.filter((e) => e.nivel === "Medio").length;

  const totalBajos = dataRiesgo.filter((e) => e.nivel === "Bajo").length;

  return (
    <>
      <div className="tab-header-actions">
        <h3>Análisis de riesgo de deserción</h3>
      </div>

      {/* RESUMEN */}
      <div className="riesgo-resumen">
        <div className="riesgo-card riesgo-alto">
          <h4>🔴 Alto riesgo</h4>
          <span>{totalAltos}</span>
        </div>

        <div className="riesgo-card riesgo-medio">
          <h4>🟠 Riesgo medio</h4>
          <span>{totalMedios}</span>
        </div>

        <div className="riesgo-card riesgo-bajo">
          <h4>🟢 Bajo riesgo</h4>
          <span>{totalBajos}</span>
        </div>
      </div>

      {/* TABLA */}
      <div className="tabla-wrapper">
        {cargando ? (
          <p className="estado-msg">Calculando riesgo...</p>
        ) : (
          <table className="tabla-estudiantes">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Promedio</th>
                <th>Asistencia</th>
                <th>Puntaje riesgo</th>
                <th>Nivel</th>
                <th>Encuestas</th>
              </tr>
            </thead>

            <tbody>
              {dataRiesgo.map((e, i) => (
                <tr key={i}>
                  <td>{e.estudiante}</td>

                  <td>{e.promedio}</td>

                  <td>{e.asistencia}%</td>

                  <td>{e.riesgo}</td>

                  <td>
                    <span
                      className={`riesgo-badge ${
                        e.nivel === "Alto"
                          ? "badge-riesgo-alto"
                          : e.nivel === "Medio"
                            ? "badge-riesgo-medio"
                            : "badge-riesgo-bajo"
                      }`}
                    >
                      {e.nivel}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn-ver-encuestas"
                      onClick={() => abrirEncuestas(e)}
                    >
                      👁 Ver encuestas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL ENCUESTAS */}
      {modalEncuestas && (
        <div className="modal-overlay" onClick={cerrarEncuestas}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Encuestas respondidas</h2>

              <button className="modal-close" onClick={cerrarEncuestas}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: "20px" }}>
              <p>
                <strong>Estudiante:</strong>{" "}
                {estudianteSeleccionado?.estudiante}
              </p>

              {cargandoEncuestas ? (
                <p style={{ marginTop: "20px" }}>Cargando encuestas...</p>
              ) : encuestasRespondidas.length === 0 ? (
                <p style={{ marginTop: "20px" }}>
                  Este estudiante no ha respondido encuestas.
                </p>
              ) : (
                <div className="lista-encuestas">
                  {encuestasRespondidas.map((encuesta) => (
                    <div
                      key={encuesta.id}
                      className="encuesta-item"
                      onClick={() => abrirDetalleEncuesta(encuesta)}
                    >
                      <div>
                        <h4>{encuesta.encuestas?.titulo}</h4>

                        <p>
                          Respondida el{" "}
                          {new Date(encuesta.fecha).toLocaleDateString()}
                        </p>
                      </div>

                      <span>➡️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {modalDetalle && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div
            className="modal modal-detalle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{encuestaSeleccionada?.encuestas?.titulo}</h2>

              <button className="modal-close" onClick={cerrarDetalle}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: "20px" }}>
              {cargandoDetalle ? (
                <p>Cargando respuestas...</p>
              ) : (
                <div className="detalle-respuestas">
                  {detalleEncuesta.map((r) => (
                    <div key={r.id} className="respuesta-card">
                      <h4>{r.preguntas?.pregunta}</h4>

                      <p>{r.respuesta}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
const VerCurso = ({ curso, docente, onVolver }) => {
  const [pestana, setPestana] = useState("estudiantes");

  const [estudiantes, setEstudiantes] = useState([]);

  const [cargando, setCargando] = useState(true);

  const cargarEstudiantes = async () => {
    setCargando(true);

    const { data: matriculas, error } = await supabase
      .from("matriculas")
      .select("id, estudiante_id")
      .eq("curso_id", curso.id);

    if (error || !matriculas?.length) {
      setEstudiantes([]);
      setCargando(false);
      return;
    }

    const ids = matriculas.map((m) => m.estudiante_id);

    const { data: usuarios } = await supabase
      .from("usuarios")
      .select("id, nombre_completo, email, numero_documento")
      .in("id", ids);

    setEstudiantes(
      matriculas.map((m) => ({
        ...m,
        usuarios: usuarios?.find((u) => u.id === m.estudiante_id) || null,
      })),
    );

    setCargando(false);
  };

  useEffect(() => {
    cargarEstudiantes();
  }, [curso.id]);

  return (
    <div className="teacher-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <div className="logo-circle">S</div>

            <div>
              <h2>SIEP</h2>
              <p>Docente</p>
            </div>
          </div>

          <nav className="menu">
            <button className="menu-item" onClick={onVolver}>
              <span>📚</span>
              Mis cursos
            </button>

            <button className="menu-item active">
              <span>👥</span>
              Ver curso
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>{curso.nombre}</h1>
            <p>{curso.programa}</p>
          </div>

          <div className="teacher-profile">
            <div className="profile-avatar">
              {docente?.nombre_completo?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4>{docente?.nombre_completo}</h4>
            </div>
          </div>
        </header>

        {/* PESTAÑAS */}
        <div className="tabs-bar">
          {[
            {
              id: "estudiantes",
              label: "👥 Estudiantes",
            },

            {
              id: "notas",
              label: "📝 Notas",
            },

            {
              id: "asistencia",
              label: "📅 Asistencia",
            },

            {
              id: "riesgo",
              label: "📊 Riesgo",
            },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${pestana === t.id ? "tab-active" : ""}`}
              onClick={() => setPestana(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="tab-content">
          {pestana === "estudiantes" && (
            <TabEstudiantes estudiantes={estudiantes} cargando={cargando} />
          )}

          {pestana === "notas" && <TabNotas estudiantes={estudiantes} />}

          {pestana === "asistencia" && (
            <TabAsistencia estudiantes={estudiantes} />
          )}

          {pestana === "riesgo" && <TabRiesgo estudiantes={estudiantes} />}
        </div>
      </main>
    </div>
  );
};

export default VerCurso;
