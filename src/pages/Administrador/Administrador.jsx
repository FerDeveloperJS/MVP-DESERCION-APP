import React, { useEffect, useState } from "react";
import "./Administrador.css";

import { supabase } from "../../supabaseClient.js";

const Administrador = () => {
  const [admin, setAdmin] = useState(null);

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

      // BUSCAR ADMIN EN TABLA
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

            <form className="survey-form">
              {/* TITULO */}
              <div className="input-group">
                <label>Título de la encuesta</label>

                <input
                  type="text"
                  placeholder="Ej: Encuesta de bienestar emocional"
                />
              </div>

              {/* PREGUNTA 1 */}
              <div className="input-group">
                <label>Pregunta 1</label>

                <input type="text" placeholder="Escribe la pregunta 1" />
              </div>

              {/* PREGUNTA 2 */}
              <div className="input-group">
                <label>Pregunta 2</label>

                <input type="text" placeholder="Escribe la pregunta 2" />
              </div>

              {/* PREGUNTA 3 */}
              <div className="input-group">
                <label>Pregunta 3</label>

                <input type="text" placeholder="Escribe la pregunta 3" />
              </div>

              {/* PREGUNTA 4 */}
              <div className="input-group">
                <label>Pregunta 4</label>

                <input type="text" placeholder="Escribe la pregunta 4" />
              </div>

              {/* PREGUNTA 5 */}
              <div className="input-group">
                <label>Pregunta 5</label>

                <input type="text" placeholder="Escribe la pregunta 5" />
              </div>

              {/* PREGUNTA 6 */}
              <div className="input-group">
                <label>Pregunta 6</label>

                <input type="text" placeholder="Escribe la pregunta 6" />
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
