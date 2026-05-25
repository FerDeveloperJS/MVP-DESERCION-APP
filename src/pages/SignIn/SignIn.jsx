import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- Añadimos useNavigate para redirigir
import { supabase } from "../../supabaseClient.js"; // <-- Ajusta la ruta de tu cliente de Supabase
import "./SignIn.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  // Estados para feedback visual y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Hook para navegar tras el login exitoso

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
      // Iniciar sesión con Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.correo,
          password: formData.password,
        });

      if (signInError) throw signInError;

      // ¡Inicio de sesión exitoso!
      console.log("Usuario autenticado:", data.user);

      // Aquí lo rediriges a la ruta protegida de tu app (ej. /dashboard o /home)
      navigate("/dashboard");
    } catch (err) {
      // Captura errores comunes (credenciales inválidas, correo no confirmado, etc.)
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
