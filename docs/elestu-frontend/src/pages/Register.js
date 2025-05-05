import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    // Simulación de registro
    if (name && email && password) {
      console.log("Usuario registrado:", { name, email, password });
      navigate("/login");
    } else {
      alert("Rellena todos los campos");
    }
  }

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={function (e) { setName(e.target.value); }}
        />
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
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;
