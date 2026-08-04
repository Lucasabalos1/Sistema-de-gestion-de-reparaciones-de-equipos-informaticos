import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./Pages/Login";
import { Dashboard } from "./Pages/Dashboard";
import { Notificaciones } from "./Pages/Notificaciones";
import { Clientes } from "./Pages/Clientes";
import { Servicios } from "./Pages/Servicios";
import { Inventario } from "./Pages/Inventario";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./Components/Global/protectedRoute";

export const App = () => {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clientes/></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Servicios/></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventario/></ProtectedRoute>} />
          <Route path='/' element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </>
  )
}
