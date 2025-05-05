import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    // Simulación de autenticación
    if (email === "test@example.com" && password === "1234") {
      navigate("/");
    } else {
      alert("Credenciales incorrectas");
    }
  }

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={function (e) { setEmail(e.target.value); }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
