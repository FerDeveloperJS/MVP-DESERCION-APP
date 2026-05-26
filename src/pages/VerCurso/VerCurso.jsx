import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import "./VerCurso.css";

/* ─────────────────────────────────────────────
   TAB: ESTUDIANTES
───────────────────────────────────────────── */
const TabEstudiantes = ({ curso, estudiantes, cargando, recargar }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: "",
    email: "",
    numero_documento: "",
  });
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAgregar = async () => {
    setGuardando(true);
    setMensaje(null);
    const { email, nombre_completo, numero_documento } = form;

    if (!email || !nombre_completo || !numero_documento) {
      setMensaje({
        tipo: "error",
        texto: "Por favor completa todos los campos.",
      });
      setGuardando(false);
      return;
    }

    try {
      const { data: existente } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      let estudianteId;
      if (existente) {
        estudianteId = existente.id;
      } else {
        const { data: nuevo, error } = await supabase
          .from("usuarios")
          .insert([
            { nombre_completo, email, numero_documento, rol: "estudiante" },
          ])
          .select()
          .single();
        if (error) throw error;
        estudianteId = nuevo.id;
      }

      const { data: ya } = await supabase
        .from("matriculas")
        .select("id")
        .eq("curso_id", curso.id)
        .eq("estudiante_id", estudianteId)
        .maybeSingle();

      if (ya) {
        setMensaje({
          tipo: "error",
          texto: "Este estudiante ya está matriculado.",
        });
        setGuardando(false);
        return;
      }

      const { error: err } = await supabase
        .from("matriculas")
        .insert([{ curso_id: curso.id, estudiante_id: estudianteId }]);
      if (err) throw err;

      setMensaje({
        tipo: "exito",
        texto: "¡Estudiante agregado correctamente!",
      });
      setForm({ nombre_completo: "", email: "", numero_documento: "" });
      recargar();
    } catch (err) {
      console.error(err);
      setMensaje({
        tipo: "error",
        texto: "Ocurrió un error. Intenta nuevamente.",
      });
    }
    setGuardando(false);
  };

  const cerrar = () => {
    setModalAbierto(false);
    setMensaje(null);
    setForm({ nombre_completo: "", email: "", numero_documento: "" });
  };

  return (
    <>
      <div className="tab-header-actions">
        <h3>Estudiantes matriculados</h3>
        <button className="btn-agregar" onClick={() => setModalAbierto(true)}>
          + Agregar estudiante
        </button>
      </div>

      <div className="tabla-wrapper">
        {cargando ? (
          <p className="estado-msg">Cargando estudiantes...</p>
        ) : estudiantes.length === 0 ? (
          <p className="sin-estudiantes">
            No hay estudiantes matriculados aún.
          </p>
        ) : (
          <table className="tabla-estudiantes">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre completo</th>
                <th>Email</th>
                <th>N° Documento</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td>{m.usuarios?.nombre_completo}</td>
                  <td>{m.usuarios?.email}</td>
                  <td>{m.usuarios?.numero_documento}</td>
                  <td>
                    <span className={`badge badge-${m.usuarios?.rol}`}>
                      {m.usuarios?.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar estudiante</h2>
              <button className="modal-close" onClick={cerrar}>
                ✕
              </button>
            </div>
            <p className="modal-subtitulo">
              Si el estudiante ya existe por email, solo se matriculará al
              curso.
            </p>
            <div className="modal-form">
              <label>Nombre completo *</label>
              <input
                name="nombre_completo"
                value={form.nombre_completo}
                onChange={handleChange}
                placeholder="Ej: María López"
              />
              <label>Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej: maria@correo.com"
              />
              <label>Número de documento *</label>
              <input
                name="numero_documento"
                value={form.numero_documento}
                onChange={handleChange}
                placeholder="Ej: 1001234567"
              />
            </div>
            {mensaje && (
              <p className={`modal-mensaje ${mensaje.tipo}`}>{mensaje.texto}</p>
            )}
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrar}>
                Cancelar
              </button>
              <button
                className="btn-guardar"
                onClick={handleAgregar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   TAB: NOTAS
───────────────────────────────────────────── */
const TabNotas = ({ curso, estudiantes }) => {
  const [actividades, setActividades] = useState([]);
  const [notas, setNotas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [modalActividad, setModalActividad] = useState(false);
  const [formAct, setFormAct] = useState({
    nombre: "",
    descripcion: "",
    porcentaje: "",
  });
  const [guardandoAct, setGuardandoAct] = useState(false);
  const [mensajeAct, setMensajeAct] = useState(null);
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [mensajeNotas, setMensajeNotas] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    const { data: acts } = await supabase
      .from("actividades")
      .select("*")
      .eq("curso_id", curso.id)
      .order("created_at");

    if (!acts?.length) {
      setActividades([]);
      setCargando(false);
      return;
    }
    setActividades(acts);

    const actIds = acts.map((a) => a.id);
    const { data: notasData } = await supabase
      .from("notas")
      .select("*")
      .in("actividad_id", actIds);

    const mapa = {};
    notasData?.forEach((n) => {
      mapa[`${n.actividad_id}_${n.estudiante_id}`] = n.nota ?? "";
    });
    setNotas(mapa);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [curso.id]);

  const handleCrearActividad = async () => {
    setGuardandoAct(true);
    setMensajeAct(null);
    if (!formAct.nombre) {
      setMensajeAct({ tipo: "error", texto: "El nombre es obligatorio." });
      setGuardandoAct(false);
      return;
    }
    const { error } = await supabase.from("actividades").insert([
      {
        curso_id: curso.id,
        nombre: formAct.nombre,
        descripcion: formAct.descripcion,
        porcentaje: formAct.porcentaje || null,
      },
    ]);
    if (error) {
      setMensajeAct({ tipo: "error", texto: "Error al crear actividad." });
    } else {
      setMensajeAct({ tipo: "exito", texto: "Actividad creada." });
      setFormAct({ nombre: "", descripcion: "", porcentaje: "" });
      cargarDatos();
    }
    setGuardandoAct(false);
  };

  const handleNotaChange = (actId, estId, valor) => {
    setNotas((prev) => ({ ...prev, [`${actId}_${estId}`]: valor }));
  };

  const handleGuardarNotas = async () => {
    setGuardandoNotas(true);
    setMensajeNotas(null);

    const upserts = [];
    actividades.forEach((act) => {
      estudiantes.forEach((m) => {
        const key = `${act.id}_${m.estudiante_id}`;
        const nota = notas[key];
        if (nota !== "" && nota !== undefined) {
          upserts.push({
            actividad_id: act.id,
            estudiante_id: m.estudiante_id,
            nota: parseFloat(nota),
          });
        }
      });
    });

    if (!upserts.length) {
      setMensajeNotas({ tipo: "error", texto: "No hay notas para guardar." });
      setGuardandoNotas(false);
      return;
    }

    const { error } = await supabase
      .from("notas")
      .upsert(upserts, { onConflict: "actividad_id,estudiante_id" });

    if (error) {
      console.error(error);
      setMensajeNotas({ tipo: "error", texto: "Error al guardar notas." });
    } else {
      setMensajeNotas({
        tipo: "exito",
        texto: "¡Notas guardadas correctamente!",
      });
    }
    setGuardandoNotas(false);
  };

  const promedioEstudiante = (estudianteId) => {
    let suma = 0,
      totalPeso = 0;
    actividades.forEach((act) => {
      const nota = parseFloat(notas[`${act.id}_${estudianteId}`]);
      if (!isNaN(nota)) {
        const peso = parseFloat(act.porcentaje) || 0;
        suma += nota * (peso / 100);
        totalPeso += peso;
      }
    });
    return totalPeso > 0 ? suma.toFixed(2) : "-";
  };

  const cerrarModalAct = () => {
    setModalActividad(false);
    setMensajeAct(null);
    setFormAct({ nombre: "", descripcion: "", porcentaje: "" });
  };

  return (
    <>
      <div className="tab-header-actions">
        <h3>Registro de notas</h3>
        <button className="btn-agregar" onClick={() => setModalActividad(true)}>
          + Nueva actividad
        </button>
      </div>

      {cargando ? (
        <p className="estado-msg">Cargando notas...</p>
      ) : actividades.length === 0 ? (
        <p className="sin-estudiantes">
          No hay actividades creadas. Crea una para empezar.
        </p>
      ) : estudiantes.length === 0 ? (
        <p className="sin-estudiantes">No hay estudiantes matriculados.</p>
      ) : (
        <>
          <div className="tabla-wrapper tabla-scroll">
            <table className="tabla-estudiantes tabla-notas">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  {actividades.map((a) => (
                    <th key={a.id}>
                      {a.nombre}
                      {a.porcentaje ? (
                        <span className="badge-pct">{a.porcentaje}%</span>
                      ) : (
                        ""
                      )}
                    </th>
                  ))}
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((m) => (
                  <tr key={m.id}>
                    <td className="td-nombre">{m.usuarios?.nombre_completo}</td>
                    {actividades.map((act) => (
                      <td key={act.id}>
                        <input
                          className="input-nota"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={notas[`${act.id}_${m.estudiante_id}`] ?? ""}
                          onChange={(e) =>
                            handleNotaChange(
                              act.id,
                              m.estudiante_id,
                              e.target.value,
                            )
                          }
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="td-promedio">
                      {promedioEstudiante(m.estudiante_id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mensajeNotas && (
            <p className={`modal-mensaje ${mensajeNotas.tipo}`}>
              {mensajeNotas.texto}
            </p>
          )}
          <div className="notas-footer">
            <button
              className="btn-guardar"
              onClick={handleGuardarNotas}
              disabled={guardandoNotas}
            >
              {guardandoNotas ? "Guardando..." : "💾 Guardar notas"}
            </button>
          </div>
        </>
      )}

      {modalActividad && (
        <div className="modal-overlay" onClick={cerrarModalAct}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva actividad</h2>
              <button className="modal-close" onClick={cerrarModalAct}>
                ✕
              </button>
            </div>
            <div className="modal-form">
              <label>Nombre *</label>
              <input
                value={formAct.nombre}
                onChange={(e) =>
                  setFormAct({ ...formAct, nombre: e.target.value })
                }
                placeholder="Ej: Parcial 1, Taller Final..."
              />
              <label>Descripción</label>
              <input
                value={formAct.descripcion}
                onChange={(e) =>
                  setFormAct({ ...formAct, descripcion: e.target.value })
                }
                placeholder="Opcional"
              />
              <label>Porcentaje (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formAct.porcentaje}
                onChange={(e) =>
                  setFormAct({ ...formAct, porcentaje: e.target.value })
                }
                placeholder="Ej: 30"
              />
            </div>
            {mensajeAct && (
              <p className={`modal-mensaje ${mensajeAct.tipo}`}>
                {mensajeAct.texto}
              </p>
            )}
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalAct}>
                Cancelar
              </button>
              <button
                className="btn-guardar"
                onClick={handleCrearActividad}
                disabled={guardandoAct}
              >
                {guardandoAct ? "Guardando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   TAB: ASISTENCIA
───────────────────────────────────────────── */
const TabAsistencia = ({ curso, estudiantes }) => {
  const [sesiones, setSesiones] = useState([]);
  const [sesionActiva, setSesionActiva] = useState(null);
  const [asistencias, setAsistencias] = useState({});
  const [cargando, setCargando] = useState(true);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [modalSesion, setModalSesion] = useState(false);
  const [formSes, setFormSes] = useState({ fecha: "", tema: "" });
  const [guardandoSes, setGuardandoSes] = useState(false);
  const [mensajeSes, setMensajeSes] = useState(null);
  const [guardandoAsis, setGuardandoAsis] = useState(false);
  const [mensajeAsis, setMensajeAsis] = useState(null);

  const cargarSesiones = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("sesiones")
      .select("*")
      .eq("curso_id", curso.id)
      .order("fecha", { ascending: false });
    setSesiones(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarSesiones();
  }, [curso.id]);

  const seleccionarSesion = async (sesion) => {
    setSesionActiva(sesion);
    setMensajeAsis(null);
    setCargandoLista(true);

    const { data } = await supabase
      .from("asistencias")
      .select("*")
      .eq("sesion_id", sesion.id);

    const mapa = {};
    estudiantes.forEach((m) => {
      mapa[m.estudiante_id] = "ausente";
    });
    data?.forEach((a) => {
      mapa[a.estudiante_id] = a.estado;
    });
    setAsistencias(mapa);
    setCargandoLista(false);
  };

  const handleCrearSesion = async () => {
    setGuardandoSes(true);
    setMensajeSes(null);
    if (!formSes.fecha) {
      setMensajeSes({ tipo: "error", texto: "La fecha es obligatoria." });
      setGuardandoSes(false);
      return;
    }
    const { data, error } = await supabase
      .from("sesiones")
      .insert([
        { curso_id: curso.id, fecha: formSes.fecha, tema: formSes.tema },
      ])
      .select()
      .single();

    if (error) {
      setMensajeSes({ tipo: "error", texto: "Error al crear la sesión." });
    } else {
      setMensajeSes({ tipo: "exito", texto: "Sesión creada." });
      setFormSes({ fecha: "", tema: "" });
      await cargarSesiones();
      setModalSesion(false);
      seleccionarSesion(data);
    }
    setGuardandoSes(false);
  };

  const handleGuardarAsistencia = async () => {
    if (!sesionActiva) return;
    setGuardandoAsis(true);
    setMensajeAsis(null);

    const upserts = Object.entries(asistencias).map(([estId, estado]) => ({
      sesion_id: sesionActiva.id,
      estudiante_id: estId,
      estado,
    }));

    const { error } = await supabase
      .from("asistencias")
      .upsert(upserts, { onConflict: "sesion_id,estudiante_id" });

    if (error) {
      console.error(error);
      setMensajeAsis({ tipo: "error", texto: "Error al guardar asistencia." });
    } else {
      setMensajeAsis({
        tipo: "exito",
        texto: "¡Asistencia guardada correctamente!",
      });
    }
    setGuardandoAsis(false);
  };

  const toggleEstado = (estId) => {
    const ciclo = {
      ausente: "presente",
      presente: "excusa",
      excusa: "ausente",
    };
    setAsistencias((prev) => ({
      ...prev,
      [estId]: ciclo[prev[estId]] || "ausente",
    }));
  };

  const estadoLabel = {
    presente: "✅ Presente",
    ausente: "❌ Ausente",
    excusa: "⚠️ Excusa",
  };
  const estadoClass = {
    presente: "est-presente",
    ausente: "est-ausente",
    excusa: "est-excusa",
  };

  const cerrarModalSes = () => {
    setModalSesion(false);
    setMensajeSes(null);
    setFormSes({ fecha: "", tema: "" });
  };

  const resumen = sesionActiva
    ? {
        presentes: Object.values(asistencias).filter((e) => e === "presente")
          .length,
        ausentes: Object.values(asistencias).filter((e) => e === "ausente")
          .length,
        excusas: Object.values(asistencias).filter((e) => e === "excusa")
          .length,
      }
    : null;

  return (
    <>
      <div className="tab-header-actions">
        <h3>Registro de asistencia</h3>
        <button className="btn-agregar" onClick={() => setModalSesion(true)}>
          + Nueva sesión
        </button>
      </div>

      <div className="asistencia-layout">
        {/* PANEL IZQUIERDO: lista de sesiones */}
        <div className="sesiones-panel">
          <h4 className="panel-title">Sesiones</h4>
          {cargando ? (
            <p className="estado-msg">Cargando...</p>
          ) : sesiones.length === 0 ? (
            <p className="sin-estudiantes" style={{ fontSize: "0.82rem" }}>
              Sin sesiones aún.
            </p>
          ) : (
            <ul className="sesiones-list">
              {sesiones.map((s) => (
                <li
                  key={s.id}
                  className={`sesion-item ${sesionActiva?.id === s.id ? "sesion-activa" : ""}`}
                  onClick={() => seleccionarSesion(s)}
                >
                  <span className="sesion-fecha">{s.fecha}</span>
                  <span className="sesion-tema">{s.tema || "Sin tema"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PANEL DERECHO: lista de asistencia */}
        <div className="asistencia-panel">
          {!sesionActiva ? (
            <div className="empty-state">
              <span style={{ fontSize: "2.5rem" }}>📅</span>
              <p>Selecciona una sesión para registrar asistencia</p>
            </div>
          ) : cargandoLista ? (
            <p className="estado-msg">Cargando lista...</p>
          ) : (
            <>
              <div className="asistencia-header">
                <div>
                  <h4>{sesionActiva.fecha}</h4>
                  {sesionActiva.tema && (
                    <p className="sesion-subtema">{sesionActiva.tema}</p>
                  )}
                </div>
                {resumen && (
                  <div className="resumen-chips">
                    <span className="chip chip-verde">
                      ✅ {resumen.presentes}
                    </span>
                    <span className="chip chip-rojo">
                      ❌ {resumen.ausentes}
                    </span>
                    <span className="chip chip-amarillo">
                      ⚠️ {resumen.excusas}
                    </span>
                  </div>
                )}
              </div>

              {estudiantes.length === 0 ? (
                <p className="sin-estudiantes">
                  No hay estudiantes matriculados.
                </p>
              ) : (
                <div className="tabla-wrapper">
                  <table className="tabla-estudiantes">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Estudiante</th>
                        <th>Estado (clic para cambiar)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((m, i) => {
                        const estado =
                          asistencias[m.estudiante_id] || "ausente";
                        return (
                          <tr key={m.id}>
                            <td>{i + 1}</td>
                            <td>{m.usuarios?.nombre_completo}</td>
                            <td>
                              <button
                                className={`btn-estado ${estadoClass[estado]}`}
                                onClick={() => toggleEstado(m.estudiante_id)}
                              >
                                {estadoLabel[estado]}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {mensajeAsis && (
                <p className={`modal-mensaje ${mensajeAsis.tipo}`}>
                  {mensajeAsis.texto}
                </p>
              )}
              <div className="notas-footer">
                <button
                  className="btn-guardar"
                  onClick={handleGuardarAsistencia}
                  disabled={guardandoAsis}
                >
                  {guardandoAsis ? "Guardando..." : "💾 Guardar asistencia"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL NUEVA SESIÓN */}
      {modalSesion && (
        <div className="modal-overlay" onClick={cerrarModalSes}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva sesión de clase</h2>
              <button className="modal-close" onClick={cerrarModalSes}>
                ✕
              </button>
            </div>
            <div className="modal-form">
              <label>Fecha *</label>
              <input
                type="date"
                value={formSes.fecha}
                onChange={(e) =>
                  setFormSes({ ...formSes, fecha: e.target.value })
                }
              />
              <label>Tema de la clase</label>
              <input
                value={formSes.tema}
                onChange={(e) =>
                  setFormSes({ ...formSes, tema: e.target.value })
                }
                placeholder="Ej: Introducción a React"
              />
            </div>
            {mensajeSes && (
              <p className={`modal-mensaje ${mensajeSes.tipo}`}>
                {mensajeSes.texto}
              </p>
            )}
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalSes}>
                Cancelar
              </button>
              <button
                className="btn-guardar"
                onClick={handleCrearSesion}
                disabled={guardandoSes}
              >
                {guardandoSes ? "Guardando..." : "Crear sesión"}
              </button>
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
      .select("id, nombre_completo, email, numero_documento, rol")
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
              <span>📚</span> Mis cursos
            </button>
            <button className="menu-item active">
              <span>👥</span> Ver curso
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
          <div className="ver-curso-actions">
            <div className="teacher-profile">
              <div className="profile-avatar">
                {docente?.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4>{docente?.nombre_completo}</h4>
              </div>
            </div>
          </div>
        </header>

        {/* PESTAÑAS */}
        <div className="tabs-bar">
          {[
            { id: "estudiantes", label: "👥 Estudiantes" },
            { id: "notas", label: "📝 Notas" },
            { id: "asistencia", label: "📅 Asistencia" },
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

        {/* CONTENIDO POR PESTAÑA */}
        <div className="tab-content">
          {pestana === "estudiantes" && (
            <TabEstudiantes
              curso={curso}
              estudiantes={estudiantes}
              cargando={cargando}
              recargar={cargarEstudiantes}
            />
          )}
          {pestana === "notas" && (
            <TabNotas curso={curso} estudiantes={estudiantes} />
          )}
          {pestana === "asistencia" && (
            <TabAsistencia curso={curso} estudiantes={estudiantes} />
          )}
        </div>
      </main>
    </div>
  );
};

export default VerCurso;
