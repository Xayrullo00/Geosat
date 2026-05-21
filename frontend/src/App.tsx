import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Satellite from "./pages/Satellite";
import Weather from "./pages/Weather";
import Disease from "./pages/Disease";
import Calendar from "./pages/Calendar";
import Forecast from "./pages/Forecast";
import Crops from "./pages/Crops";
import Advisory from "./pages/Advisory";
import Fields from "./pages/Fields";

function PrivateRoute({ children, requireProfile = true }: { children: React.ReactNode; requireProfile?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">{/* loading */}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile && !user.profile_complete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/onboarding"
        element={
          <PrivateRoute requireProfile={false}>
            <Onboarding />
          </PrivateRoute>
        }
      />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="satellite" element={<Satellite />} />
        <Route path="weather" element={<Weather />} />
        <Route path="disease" element={<Disease />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="crops" element={<Crops />} />
        <Route path="advisory" element={<Advisory />} />
        <Route path="fields" element={<Fields />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
