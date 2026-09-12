import { Routes, Route } from "react-router";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>Home page</h1>} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
