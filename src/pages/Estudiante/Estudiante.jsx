import React, { useEffect, useState } from "react";
import "./Estudiante.css";

import { supabase } from "../../supabaseClient.js";

const Estudiante = () => {
  const [estudiante, setEstudiante] = useState(null);

  useEffect(() => {
    const obtenerEstudiante = async () => {
      // USUARIO AUTENTICADO
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.log(authError);
        return;
      }

      const user = authData.user;

      // BUSCAR ESTUDIANTE
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setEstudiante(data);
    };

    obtenerEstudiante();
  }, []);

  return (
    <div className="student-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* LOGO */}
          <div className="logo">
            <div className="logo-circle">S</div>

            <div>
              <h2>SIEP</h2>
              <p>Estudiante</p>
            </div>
          </div>

          {/* MENU */}
          <nav className="menu">
            <button className="menu-item active">
              <span>📋</span>
              Mis encuestas
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
            <h1>Mis Encuestas</h1>

            <p>
              Responde las encuestas asignadas para evaluar tu bienestar
              académico.
            </p>
          </div>

          {/* PERFIL */}
          <div className="student-profile">
            <div className="profile-avatar">
              {estudiante?.nombre_completo?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4>{estudiante?.nombre_completo}</h4>
            </div>
          </div>
        </header>

        {/* ENCUESTAS PENDIENTES */}
        <section className="surveys-section">
          <h2 className="section-title">Encuestas Pendientes</h2>

          {/* ENCUESTA 1 */}
          <div className="survey-card">
            <h3>Encuesta de Bienestar</h3>

            <p>Evaluación emocional y académica semanal.</p>

            <div className="survey-info">
              <span>📅 Disponible hoy</span>
            </div>

            <button>Responder encuesta</button>
          </div>

          {/* ENCUESTA 2 */}
          <div className="survey-card">
            <h3>Seguimiento Académico</h3>

            <p>Monitoreo del rendimiento y carga académica.</p>

            <div className="survey-info">
              <span>📅 Disponible hoy</span>
            </div>

            <button>Responder encuesta</button>
          </div>
        </section>

        {/* ENCUESTAS RESPONDIDAS */}
        <section className="surveys-section">
          <h2 className="section-title">Encuestas Respondidas</h2>

          {/* ENCUESTA RESPONDIDA 1 */}
          <div className="survey-card">
            <h3>Encuesta de Estrés Académico</h3>

            <p>Encuesta completada correctamente.</p>

            <div className="survey-info">
              <span>✅ Respondida el 24/05/2026</span>
            </div>

            <button disabled>Respondida</button>
          </div>

          {/* ENCUESTA RESPONDIDA 2 */}
          <div className="survey-card">
            <h3>Encuesta de Adaptación Universitaria</h3>

            <p>Encuesta completada correctamente.</p>

            <div className="survey-info">
              <span>✅ Respondida el 20/05/2026</span>
            </div>

            <button disabled>Respondida</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Estudiante;
