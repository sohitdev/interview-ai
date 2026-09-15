import { Routes, Route } from "react-router";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import Protected from "./features/auth/components/protected.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/Interview.jsx";
import { InterviewProvider } from "./features/interview/interview.context.jsx";

const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/interview/:interviewId"
            element={
              <Protected>
                <Interview />
              </Protected>
            }
          />
        </Routes>
      </InterviewProvider>
    </AuthProvider>
  );
};

export default App;
