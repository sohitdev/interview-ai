import { Routes, Route } from "react-router";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import Protected from "./features/auth/components/protected.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <h1>Home page</h1>
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
