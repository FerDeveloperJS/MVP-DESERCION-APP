import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./pages/SignUp/SignUp.jsx";
import SignIn from "./pages/SignIn/SignIn.jsx";
import "./App.css";
import Docente from "./pages/Docente/Docente.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/docente" element={<Docente />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
