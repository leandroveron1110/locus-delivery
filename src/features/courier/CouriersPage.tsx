
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  Courier,
  CourierStatus,
  fetchCouriers,
  updateCourier,
} from "@/mini-back/infrastructure/network/courier-api";

import { CourierStats } from "./components/CourierStats";
import { CourierFilters, StatusFilter } from "./components/CourierFilters";
import { CourierTable } from "./components/CourierTable";
import { CreateCourierModal } from "./components/CreateCourierModal";
import { EditCourierModal } from "./components/EditCourierModal";
import { ResetCourierPasswordModal } from "./components/ResetCourierPasswordModal";

export function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [passwordCourier, setPasswordCourier] = useState<Courier | null>(null);

  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  const loadCouriers = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setFeedbackError("");

    try {
      const data = await fetchCouriers();
      setCouriers(data);
    } catch (err) {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los cadetes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCouriers();
  }, [loadCouriers]);

  const filteredCouriers = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^#/, "");

    return couriers
      .filter((courier) => {
        if (statusFilter !== "ALL" && courier.status !== statusFilter) {
          return false;
        }

        if (!query) return true;

        return [
          String(courier.courierNumber),
          courier.fullName,
          courier.dni,
          courier.phone ?? "",
        ].some((field) => field.toLowerCase().includes(query));
      })
      .sort((a, b) => a.courierNumber - b.courierNumber);
  }, [couriers, search, statusFilter]);

  const handleCourierCreated = useCallback((created: Courier) => {
    setCouriers((prev) => {
      const exists = prev.some((item) => item.id === created.id);

      if (exists) {
        return prev.map((item) => item.id === created.id ? created : item);
      }

      return [...prev, created].sort(
        (a, b) => a.courierNumber - b.courierNumber,
      );
    });

    setStatusFilter("ALL");
    setSearch("");
    setFeedbackError("");
    setFeedbackSuccess(
      `Cadete #${created.courierNumber} creado correctamente.`,
    );
  }, []);

  const handleCourierUpdated = useCallback((updated: Courier) => {
    setCouriers((prev) =>
      prev.map((item) => item.id === updated.id ? updated : item),
    );

    setEditingCourier(null);
    setPasswordCourier(null);
    setFeedbackError("");
    setFeedbackSuccess(
      `Los datos de ${updated.fullName} se actualizaron correctamente.`,
    );
  }, []);

  const handleToggleEnabled = useCallback(async (courier: Courier) => {
    if (updatingId) return;

    if (
      courier.status !== CourierStatus.ACTIVE &&
      courier.status !== CourierStatus.INACTIVE
    ) {
      return;
    }

    const nextStatus =
      courier.status === CourierStatus.ACTIVE
        ? CourierStatus.INACTIVE
        : CourierStatus.ACTIVE;

    setUpdatingId(courier.id);
    setFeedbackError("");
    setFeedbackSuccess("");

    try {
      const updated = await updateCourier(courier.id, {
        status: nextStatus,
      });

      if (!updated) {
        throw new Error("No se pudo actualizar el estado del cadete.");
      }

      setCouriers((prev) =>
        prev.map((item) => item.id === courier.id ? updated : item),
      );

      setFeedbackSuccess(
        `#${updated.courierNumber} ${updated.fullName}: ${
          nextStatus === CourierStatus.ACTIVE
            ? "habilitado correctamente."
            : "deshabilitado correctamente."
        }`,
      );
    } catch (err) {
      setFeedbackError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del cadete.",
      );
    } finally {
      setUpdatingId(null);
    }
  }, [updatingId]);

  const clearFeedback = () => {
    setFeedbackError("");
    setFeedbackSuccess("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Flota de cadetes
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Consultá los cadetes registrados y su estado actual.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadCouriers()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-500 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nuevo cadete
          </button>
        </div>
      </header>

      {feedbackError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{feedbackError}</span>
          <button
            type="button"
            onClick={() => setFeedbackError("")}
            aria-label="Cerrar error"
            className="text-rose-500 hover:text-rose-800"
          >
            ×
          </button>
        </div>
      )}

      {feedbackSuccess && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{feedbackSuccess}</span>
          <button
            type="button"
            onClick={() => setFeedbackSuccess("")}
            aria-label="Cerrar notificación"
            className="text-emerald-600 hover:text-emerald-900"
          >
            ×
          </button>
        </div>
      )}

      <CourierStats couriers={couriers} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Cadetes registrados
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Información general y situación de cada integrante de la flota.
            </p>
          </div>

          <CourierFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            resultCount={filteredCouriers.length}
          />
        </div>

        <CourierTable
          couriers={filteredCouriers}
          isLoading={isLoading}
          updatingId={updatingId}
          onToggleEnabled={handleToggleEnabled}
          onEdit={setEditingCourier}
          onResetPassword={setPasswordCourier}
        />
      </section>

      <CreateCourierModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCourierCreated}
      />

      <EditCourierModal
        courier={editingCourier}
        onClose={() => setEditingCourier(null)}
        onUpdated={handleCourierUpdated}
      />

      <ResetCourierPasswordModal
        courier={passwordCourier}
        onClose={() => setPasswordCourier(null)}
        onUpdated={handleCourierUpdated}
      />
    </div>
  );
}
