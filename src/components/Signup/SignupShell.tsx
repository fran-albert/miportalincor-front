import { ReactNode } from "react";
import { ShieldCheck, CalendarCheck, FileText } from "lucide-react";

const LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png";

/**
 * Mismo marco que el login: en escritorio, la columna de marca a la
 * izquierda; en el celular, el logo arriba y la tarjeta blanca sobre el gris
 * del portal.
 */
export function SignupShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-greenPrimary to-teal-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img
              src={LOGO_URL}
              alt="Incor Centro Médico"
              className="h-16 w-16 rounded-full bg-white p-2"
            />
            <div className="text-white">
              <h2 className="text-2xl font-bold">Incor Centro Médico</h2>
              <p className="text-white/80 text-sm">Mi Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h3 className="text-3xl font-bold text-white leading-tight">
            Creá tu cuenta en Mi Portal
          </h3>
          <p className="text-white/90 text-lg leading-relaxed">
            Tus turnos, tus estudios y tus recetas en un solo lugar.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/80">
              <CalendarCheck className="h-5 w-5" />
              <span className="text-sm">Mirá y gestioná tus turnos</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Descargá tus estudios</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm">Tus datos quedan protegidos</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2025 Incor Centro Médico. Todos los derechos reservados.
        </div>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-5">
            <img
              src={LOGO_URL}
              alt="Incor Centro Médico"
              className="h-16 w-16 rounded-full"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
