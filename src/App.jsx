import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/Toast";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a16] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="text-white/40 text-[12px] mt-4 font-mono">Verificando sesión segura...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Landing />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </div>
    </ToastProvider>
  );
}

export default App;

