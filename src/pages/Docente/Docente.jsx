import React, { useEffect, useState } from "react";
import "./Docente.css";

import { supabase } from "../../supabaseClient.js";

const Docente = () => {
  const [docente, setDocente] = useState(null);

  useEffect(() => {
    const obtenerDocente = async () => {
      // USUARIO AUTENTICADO
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.log(authError);
        return;
      }

      const user = authData.user;

      // BUSCAR DOCENTE EN LA TABLA
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setDocente(data);
    };

    obtenerDocente();
  }, []);

  return (
    <div className="teacher-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          {/* LOGO */}
          <div className="logo">
            <div className="logo-circle">S</div>

            <div>
              <h2>SIEP</h2>
              <p>Docente</p>
            </div>
          </div>

          {/* MENU */}
          <nav className="menu">
            <button className="menu-item active">
              <span>📚</span>
              Mis cursos
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
            <h1>Mis Cursos</h1>

            <p>Gestiona y monitorea el estado académico de tus estudiantes.</p>
          </div>

          {/* PERFIL DOCENTE */}
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
          {/* CURSO 1 */}
          <div className="course-card">
            <h3>Programación Web</h3>

            <p>Ingeniería de Software</p>

            <div className="course-info">
              <span>👨‍🎓 32 estudiantes</span>
              <span>⚠️ 5 en riesgo</span>
            </div>

            <button>Ver curso</button>
          </div>

          {/* CURSO 2 */}
          <div className="course-card">
            <h3>Base de Datos</h3>

            <p>Ingeniería de Sistemas</p>

            <div className="course-info">
              <span>👨‍🎓 28 estudiantes</span>
              <span>⚠️ 3 en riesgo</span>
            </div>

            <button>Ver curso</button>
          </div>

          {/* CURSO 3 */}
          <div className="course-card">
            <h3>Arquitectura de Software</h3>

            <p>Ingeniería de Software</p>

            <div className="course-info">
              <span>👨‍🎓 25 estudiantes</span>
              <span>⚠️ 2 en riesgo</span>
            </div>

            <button>Ver curso</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Docente;
