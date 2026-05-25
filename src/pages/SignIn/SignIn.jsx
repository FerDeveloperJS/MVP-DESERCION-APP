import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient.js";
import "./SignIn.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  // Estados para feedback visual y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.correo,
          password: formData.password,
        });

      if (signInError) throw signInError;

      // ¡Inicio de sesión exitoso en Auth!
      const user = data.user;
      console.log("Usuario autenticado:", user);

      // 2. Consultar el rol del usuario en tu tabla de la base de datos
      // NOTA: Asegúrate de que el nombre de la tabla ('usuarios') y la columna ('rol') coincidan con tu DB.
      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single(); // Trae un solo registro

      if (perfilError)
        throw new Error("No se pudo verificar el rol del usuario.");

      // 3. Redirección condicional según el rol
      if (perfil && perfil.rol === "docente") {
        // Redirige a la ruta asignada para el componente Docente.jsx
        navigate("/docente");
      } else {
        // Redirección por defecto si tiene otro rol (ej. estudiante, admin, etc.)
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.message || "Error al intentar iniciar sesión. Verifica tus datos.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* PANEL IZQUIERDO */}
      <div className="left-panel">
        <div className="logo-section">
          <div className="logo-circle">S</div>
          <h1>SIEP</h1>
          <p>Sistema de Identificación Temprana de Riesgo de Deserción</p>
        </div>

        <div className="left-info">
          <h2>Bienvenido de nuevo</h2>
          <p>
            Accede a la plataforma y monitorea el rendimiento estudiantil en
            tiempo real.
          </p>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="right-panel">
        <div className="login-box">
          <div className="login-header">
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales institucionales</p>
          </div>

          {/* MENSAJE DE ERROR EN CASO DE FALLAR */}
          {error && <div className="auth-alert error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Correo institucional</label>
              <input
                type="email"
                name="correo"
                placeholder="usuario@udem.edu.co"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="bottom-text">
            ¿No tienes cuenta? <Link to="/signup">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
