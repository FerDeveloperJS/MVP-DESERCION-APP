import React, { useState } from "react";
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    documento: "",
    rol: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
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

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nombre completo</label>

              <input
                type="text"
                name="nombre"
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
                placeholder="********"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn">
              Crear cuenta
            </button>
          </form>

          <div className="bottom-text">
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
