import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Logo from "@/components/Logo";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, User as UserIcon } from "lucide-react";

export const AuthModal = ({ open, onOpenChange, initialMode = "signin" }) => {
  const [mode, setMode] = useState(initialMode); // "signin" | "signup" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, recoverPassword } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      const user = result.user;

      // Ensure user profile is registered in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "Usuario de ZenTicket",
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success(`¡Bienvenido de vuelta, ${user.displayName || user.email}!`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Por favor ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    try {
      await recoverPassword(email.trim());
      toast.success("Correo de recuperación enviado", {
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña."
      });
      setMode("signin");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar el correo de recuperación. Verifique la dirección.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor completa todos los campos.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast.error("Por favor ingresa tu nombre completo.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const result = await registerWithEmail(email.trim(), password);
        const user = result.user;

        // Save user details to Firestore users collection
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name.trim(),
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        toast.success("¡Tu cuenta ha sido creada con éxito!");
      } else {
        const result = await loginWithEmail(email.trim(), password);
        toast.success(`Sesión iniciada como ${result.user.email}`);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      let errMsg = "Credenciales incorrectas o error en el sistema de autenticación.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "Este correo electrónico ya está registrado.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "La contraseña debe tener al menos 6 caracteres.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errMsg = "Correo o contraseña no válidos.";
      }
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px] bg-[#070a16] text-white border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle glowing accent */}
        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 rounded-full bg-blue-600/15 blur-2xl pointer-events-none" />
        <div className="absolute left-[-10%] bottom-[-10%] w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <DialogHeader className="items-center text-center relative z-10">
          <div className="flex justify-center mb-4 mt-1 select-none">
            <Logo size="md" variant="horizontal" theme="dark" />
          </div>
          
          <DialogTitle className="font-display text-[22px] font-extrabold tracking-tight text-white leading-tight">
            {mode === "signup" 
              ? "Crea tu cuenta gratis" 
              : mode === "forgot" 
              ? "Recuperar contraseña" 
              : "Bienvenido de nuevo"}
          </DialogTitle>
          
          <DialogDescription className="text-white/60 text-[13px] mt-1.5 max-w-[280px]">
            {mode === "signup"
              ? "Prueba ZenTicket y automatiza tus facturas hoy mismo."
              : mode === "forgot"
              ? "Ingresa tu correo para recibir un enlace de recuperación."
              : "Accede a tus tickets, facturas y gastos desde un solo lugar."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 relative z-10">
          {mode !== "forgot" && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 zt-btn-ghost-dark text-white rounded-full py-2.5 text-[13.5px] font-semibold hover:bg-white/5 transition-all border border-white/10 bg-white/[0.02]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.982 0 12 0 7.345 0 3.327 2.691 1.345 6.618l3.92 3.147z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.491 12.273c0-.818-.082-1.609-.218-2.364H12v4.545h6.464a5.532 5.532 0 01-2.4 3.627l3.745 2.9a11.895 11.895 0 004.145-8.708z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235a7.086 7.086 0 01-.364-2.235c0-.782.136-1.536.364-2.235L1.345 6.618A11.936 11.936 0 000 12c0 1.927.455 3.755 1.255 5.373l4.01-3.138z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.245 0 5.973-1.073 7.964-2.918l-3.745-2.9a7.065 7.065 0 01-4.218 1.182c-3.69 0-6.8-2.491-7.927-5.855l-4.01 3.136C3.327 21.309 7.345 24 12 24z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-x-0 h-px bg-white/10" />
                <span className="relative z-10 px-3 text-[10.5px] uppercase tracking-wider text-white/40 bg-[#070a16] font-extrabold">
                  o con tu correo
                </span>
              </div>
            </>
          )}

          {mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 py-2.5 text-[14px] text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full zt-btn-primary text-white font-extrabold uppercase tracking-wider py-3 rounded-full disabled:opacity-60 transition-all text-[12.5px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-98"
              >
                {loading ? "Enviando enlace..." : "Enviar Enlace de Recuperación"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-blue-400 hover:underline text-[12.5px] font-semibold"
                >
                  Volver a Iniciar Sesión
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 px-0.5">
              {mode === "signup" && (
                <div>
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 py-2.5 text-[14px] text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 py-2.5 text-[14px] text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-widest block">
                    Contraseña
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-blue-400 hover:underline text-[10.5px] font-extrabold uppercase tracking-wide"
                    >
                      ¿La olvidaste?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 py-2.5 text-[14px] text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/70 transition"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {mode === "signin" && (
                <div className="flex items-center gap-2 py-1 px-0.5">
                  <input
                    type="checkbox"
                    id="remember_session"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/15 bg-white/5 text-[#0B53F4] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="remember_session" className="text-[11.5px] font-semibold text-white/60 select-none cursor-pointer">
                    Mantener sesión iniciada
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 zt-btn-primary text-white font-extrabold uppercase tracking-wider py-3 rounded-full disabled:opacity-60 transition-all text-[12.5px] flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-98"
              >
                {loading ? (
                  "Procesando..."
                ) : mode === "signup" ? (
                  "Registrarse y Empezar"
                ) : (
                  "Iniciar Sesión Segura"
                )}
              </button>
            </form>
          )}

          {/* Secure details warning block */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-start gap-2.5 mt-2.5">
            <ShieldCheck className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-white/50 leading-normal text-left font-semibold">
              Tu información fiscal se almacena de forma segura y no compartimos tus datos con terceros sin autorización.
            </p>
          </div>

          <p className="text-center text-[12.5px] text-white/50 pt-2 border-t border-white/5">
            {mode === "signup" ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-blue-400 hover:underline font-extrabold"
                >
                  Inicia sesión
                </button>
              </>
            ) : mode === "forgot" ? null : (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-blue-400 hover:underline font-extrabold"
                >
                  Regístrate gratis
                </button>
              </>
            )}
          </p>

          <div className="text-center">
            <span className="text-[9.5px] text-white/30 tracking-tight block">
              Al continuar aceptas nuestro <span className="underline hover:text-white/50 cursor-pointer">Aviso de Privacidad</span> y <span className="underline hover:text-white/50 cursor-pointer">Términos de Servicio</span>.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AuthModal;
