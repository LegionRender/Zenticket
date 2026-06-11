import React from "react";
import {
  Search,
  PenLine,
  Clock,
  AlertTriangle,
  ListChecks,
  FolderClosed,
  Check,
} from "lucide-react";
import { TID } from "@/lib/testIds";
import { ZenMark } from "@/components/brand/Logo";

const rows = [
  { icon: Search, label: "Buscar portal", trad: "Tomas 5–15 minutos", zen: "Automático" },
  { icon: PenLine, label: "Captura manual", trad: "Muchos datos y repetir", zen: "100% automático" },
  { icon: Clock, label: "Tiempo invertido", trad: "15–30 minutos por factura", zen: "Menos de 1 minuto" },
  { icon: AlertTriangle, label: "Errores", trad: "Altos y frecuentes", zen: "Mínimos" },
  { icon: ListChecks, label: "Seguimiento", trad: "Difícil y desorganizado", zen: "Todo en un solo lugar" },
  { icon: FolderClosed, label: "Organización", trad: "Archivos dispersos", zen: "Historial centralizado" },
];

const ComparisonTable = () => {
  return (
    <section
      data-testid={TID.comparison.root}
      className="relative bg-white"
    >
      <div className="absolute inset-0 zt-soft-bg opacity-60" />
      <div className="relative max-w-[1240px] mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <h2 className="font-display font-extrabold text-[30px] sm:text-[34px] lg:text-[40px] leading-[1.05] tracking-tight text-slate-900">
              ZenTicket vs.
              <br /> método tradicional
            </h2>
            <p className="mt-4 text-[14px] text-slate-500">
              La diferencia es clara.
            </p>
            <svg
              className="mt-4 text-slate-300"
              width="80"
              height="40"
              viewBox="0 0 80 40"
              fill="none"
            >
              <path
                d="M2 6 C 20 30, 40 30, 70 22"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="3 3"
              />
              <path d="M64 18 L 70 22 L 66 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.18)] overflow-hidden">
              <div className="grid grid-cols-3 px-6 py-4 text-[12.5px] font-semibold border-b border-slate-100">
                <span className="text-slate-400" />
                <span className="text-slate-500">Método tradicional</span>
                <div className="text-right">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-white text-[12px]"
                    style={{
                      background:
                        "linear-gradient(180deg,#5b8cff 0%, #2152ee 100%)",
                    }}
                  >
                    <ZenMark />
                    ZenTicket
                  </span>
                </div>
              </div>
              {rows.map((r, i) => (
                <div
                  key={r.label}
                  className={`grid grid-cols-3 items-center px-6 py-3.5 text-[13.5px] ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 grid place-items-center text-slate-500">
                      <r.icon size={14} />
                    </span>
                    <span className="font-medium">{r.label}</span>
                  </div>
                  <div className="text-slate-500">{r.trad}</div>
                  <div className="flex items-center justify-end gap-2 text-slate-800">
                    <Check size={16} className="text-emerald-500" />
                    <span className="font-medium">{r.zen}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
