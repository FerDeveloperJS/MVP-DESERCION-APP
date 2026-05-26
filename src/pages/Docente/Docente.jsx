import React, { useEffect, useState } from "react";
import "./Docente.css";
import { supabase } from "../../supabaseClient.js";
import VerCurso from "../VerCurso/VerCurso";

const Docente = () => {
  const [docente, setDocente] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      // 1. Usuario autenticado
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        return;
      }
      const user = authData.user;
      console.log("Usuario autenticado:", user.id);

      // 2. Datos del docente
      const { data: docenteData, error: docenteError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();
      if (docenteError) {
        console.error("Error docente:", docenteError);
        return;
      }
      setDocente(docenteData);

      // 3. Cursos del docente
      const { data: cursosData, error: cursosError } = await supabase
        .from("cursos")
        .select("*")
        .eq("docente_id", user.id);
      if (cursosError) {
        console.error("Error cursos:", cursosError);
        return;
      }

      // 4. Conteo de matriculados por curso
      const cursosConConteo = await Promise.all(
        (cursosData || []).map(async (curso) => {
          const { count } = await supabase
            .from("matriculas")
            .select("*", { count: "exact", head: true })
            .eq("curso_id", curso.id);
          return { ...curso, totalEstudiantes: count || 0 };
        }),
      );

      setCursos(cursosConConteo);
      setCargando(false);
    };

    obtenerDatos();
  }, []);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Si hay un curso seleccionado, renderizar VerCurso
  if (cursoSeleccionado) {
    return (
      <VerCurso
        curso={cursoSeleccionado}
        docente={docente}
        onVolver={() => setCursoSeleccionado(null)}
      />
    );
  }

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
            <button className="menu-item active">
              <span>📚</span> Mis cursos
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1>Mis Cursos</h1>
            <p>Gestiona y monitorea el estado académico de tus estudiantes.</p>
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

        {/* CURSOS */}
        <section className="courses-section">
          {cargando ? (
            <p>Cargando cursos...</p>
          ) : cursos.length === 0 ? (
            <p>No tienes cursos asignados aún.</p>
          ) : (
            cursos.map((curso) => (
              <div className="course-card" key={curso.id}>
                <h3>{curso.nombre}</h3>
                <p>{curso.programa}</p>
                <div className="course-info">
                  <span>👥 {curso.totalEstudiantes} estudiantes</span>
                </div>
                <button onClick={() => setCursoSeleccionado(curso)}>
                  Ver curso
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Docente;
