import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient.js"; // <-- Ajusta la ruta según dónde guardaste tu cliente de Supabase
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    documento: "",
    rol: "",
    password: "",
  });

  // Estados para manejar la respuesta de la API y la interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    try {
      // PASO 1: Crear el usuario en el servicio de Autenticación de Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.correo,
          password: formData.password,
        },
      );

      if (signUpError) throw signUpError;

      // Obtenemos el ID único generado automáticamente por Supabase Auth
      const userId = authData?.user?.id;

      if (!userId) {
        throw new Error(
          "No se pudo obtener el identificador único del usuario.",
        );
      }

      // PASO 2: Insertar los datos adicionales en tu tabla personalizada "usuarios"
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          id: userId, // Enlazamos el UUID de autenticación
          numero_documento: formData.documento,
          nombre_completo: formData.nombre,
          email: formData.correo,
          rol: formData.rol, // Asegúrate de que coincida con tu enum 'user_role'
        },
      ]);

      if (dbError) throw dbError;

      // Si ambos pasos tienen éxito
      setSuccess(true);

      // Limpiamos el formulario
      setFormData({
        nombre: "",
        correo: "",
        documento: "",
        rol: "",
        password: "",
      });
    } catch (err) {
      // Captura y muestra los errores de Supabase o del sistema
      setError(
        err.message || "Ocurrió un error inesperado al crear la cuenta.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* PANEL IZQUIERDO */}
      <div className="left-panel">
        <div className="logo-section">
          <div className="logo-circle">S</div>
          <h1>SIEP</h1>
          <p>Sistema de Identificación Temprana de Riesgo de Deserción</p>
        </div>

        <div className="left-info">
          <h2>Monitoreo estudiantil inteligente</h2>
          <p>
            Detecta riesgos académicos de manera temprana y mejora la
            permanencia estudiantil.
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="right-panel">
        <div className="register-box">
          <div className="register-header">
            <h2>Crear cuenta</h2>
            <p>Regístrate para acceder a la plataforma SIEP</p>
          </div>

          {/* MENSAJES DE FEEDBACK AL USUARIO */}
          {error && <div className="auth-alert error-message">{error}</div>}
          {success && (
            <div className="auth-alert success-message">
              ¡Cuenta registrada exitosamente en SIEP! Revisa tu correo
              electrónico para confirmarla si es necesario.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nombre completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                placeholder="Ingresa tu nombre"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Correo institucional</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                placeholder="usuario@udem.edu.co"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Número de documento</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                placeholder="123456789"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Rol</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un rol</option>
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
                <option value="coordinador">Coordinador Académico</option>
                <option value="psicologia">Psicología y Bienestar</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="********"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Procesando..." : "Crear cuenta"}
            </button>
          </form>

          <div className="bottom-text">
            ¿Ya tienes cuenta? <Link to="/">Iniciar Sesion</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
