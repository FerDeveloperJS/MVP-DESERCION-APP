import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SignIn.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    correo: "",
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

            <button type="submit" className="login-btn">
              Ingresar
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
