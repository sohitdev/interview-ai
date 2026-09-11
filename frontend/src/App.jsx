import { Routes, Route } from "react-router";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
