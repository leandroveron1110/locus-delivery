
import { FormEvent, useState } from "react";
import { KeyRound, Loader2, X, Eye, EyeOff } from "lucide-react";

import {
  Courier,
  changeCourierPassword,
} from "@/mini-back/infrastructure/network/courier-api";

interface Props {
  courier: Courier | null;
  onClose: () => void;
  onUpdated: (courier: Courier) => void;
}

export function ResetCourierPasswordModal({
  courier,
  onClose,
  onUpdated,
}: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!courier) return null;

  const handleClose = () => {
    if (isSaving) return;

    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    if (!newPassword.trim()) {
      setError("Ingresá una nueva contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updated = await changeCourierPassword(courier.id, {
        newPassword,
      });

      if (!updated) {
        throw new Error("No se pudo restablecer la contraseña.");
      }

      setNewPassword("");
      setConfirmPassword("");
      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al restablecer la contraseña.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 id="reset-password-title" className="text-base font-black text-slate-900">
                Restablecer contraseña
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Cadete #{courier.courierNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-800">
              {courier.fullName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              DNI {courier.dni}
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            Se establecerá una contraseña nueva. El cadete deberá cambiarla
            cuando vuelva a iniciar sesión, si el backend activa esa condición.
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoFocus
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Restablecer contraseña
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
