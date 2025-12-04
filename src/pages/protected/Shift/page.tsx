import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Bell, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ShiftsPage = () => {
  const features = [
    "Gestión completa de turnos médicos",
    "Calendario visual e intuitivo",
    "Recordatorios automáticos por email y SMS",
    "Historial de citas por paciente",
    "Integración con agenda de médicos",
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-greenPrimary flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Gestión de Turnos
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de administración de citas médicas
          </p>
        </div>
        <Link to="/inicio">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center"
      >
        <Card className="max-w-2xl w-full border-2 border-dashed border-greenPrimary/30 bg-gradient-to-br from-greenPrimary/5 to-teal-600/5">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 rounded-full bg-amber-100">
              <Clock className="h-12 w-12 text-amber-600" />
            </div>
            <div className="flex justify-center mb-4">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 px-4 py-1 text-sm">
                <Bell className="w-4 h-4 mr-2" />
                Próximamente
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Estamos trabajando en esta funcionalidad
            </CardTitle>
            <CardDescription className="text-base mt-2">
              El sistema de gestión de turnos estará disponible muy pronto.
              Estamos desarrollando una experiencia completa para la administración de citas médicas.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features list */}
            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-greenPrimary" />
                Características que incluirá:
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-greenPrimary" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500 mb-4">
                ¿Tenés alguna sugerencia para esta funcionalidad?
              </p>
              <Link to="/inicio">
                <Button className="bg-greenPrimary hover:bg-greenPrimary/90">
                  Explorar otras secciones
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ShiftsPage;
