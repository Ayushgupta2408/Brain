import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChatPage from "./pages/ChatPage.jsx";

function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
