import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { User, FileText, Calendar, ArrowRight, Sparkles, X, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PatientHomePage({ name }: { name: string }) {
  const [showSurveyBanner, setShowSurveyBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("surveyBannerDismissed");
    const surveyEndDate = new Date("2025-12-31T23:59:59");
    const now = new Date();

    if (!dismissed && now <= surveyEndDate) {
      setShowSurveyBanner(true);
    }
  }, []);

  const handleDismissBanner = () => {
    setShowSurveyBanner(false);
    localStorage.setItem("surveyBannerDismissed", "true");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const actionCards = [
    {
      title: "Mis Estudios",
      description: "Consulta y descarga tus resultados de estudios médicos",
      icon: FileText,
      href: "/mis-estudios",
      gradient: "from-blue-500 to-blue-600",
      comingSoon: false,
    },
    {
      title: "Mi Perfil",
      description: "Actualiza tus datos personales y de contacto",
      icon: User,
      href: "/mi-perfil",
      gradient: "from-greenPrimary to-teal-600",
      comingSoon: false,
    },
    {
      title: "Mis Solicitudes de Recetas",
      description: "Solicita y gestiona tus recetas médicas",
      icon: ClipboardList,
      href: "/mis-solicitudes-recetas",
      gradient: "from-cyan-500 to-cyan-600",
      comingSoon: false,
    },
    {
      title: "Mis Turnos",
      description: "Visualiza tus próximas citas médicas",
      icon: Calendar,
      href: "/mis-turnos",
      gradient: "from-purple-500 to-purple-600",
      comingSoon: false,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Survey Banner */}
        <AnimatePresence>
          {showSurveyBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-4 sm:p-6 text-white shadow-lg"
            >
              {/* Botón cerrar en esquina superior derecha */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismissBanner}
                className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-8">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-white/20 rounded-full shrink-0">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">¡Tu opinión es importante!</h3>
                    <p className="text-white/90 text-sm">
                      Ayudanos a mejorar el portal respondiendo una breve encuesta. Disponible hasta el 31 de diciembre.
                    </p>
                  </div>
                </div>
                <a
                  href="https://forms.gle/13Rj9WtMSvEFudbq8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto shrink-0"
                >
                  <Button
                    className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
                  >
                    Responder encuesta
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-greenPrimary to-teal-600 p-8 sm:p-12 text-white shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-6 w-6" />
              <span className="text-lg font-medium opacity-90">{getGreeting()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              ¡Bienvenido, {name}!
            </h1>
            <p className="text-white/90 text-base sm:text-lg max-w-2xl">
              Accede a toda la información sobre tu bienestar y salud de manera
              segura y confidencial desde Mi Portal.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </motion.div>

        {/* Quick Access Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Acceso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actionCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {card.comingSoon ? (
                  // Card deshabilitado para funcionalidades próximamente
                  <Card className="relative overflow-hidden border-2 border-gray-200 transition-all duration-300 h-full opacity-75 cursor-not-allowed">
                    <div className="absolute inset-0 bg-gray-50/80" />

                    <CardHeader className="relative pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} opacity-60`}>
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                          Próximamente
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-600">
                        {card.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative">
                      <CardDescription className="text-sm text-gray-500">
                        {card.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ) : (
                  // Card activo con link
                  <Link to={card.href}>
                    <Card className="group relative overflow-hidden border-2 border-transparent hover:border-greenPrimary/20 transition-all duration-300 h-full hover:shadow-xl hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-greenPrimary/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} group-hover:scale-110 transition-transform duration-300`}>
                            <card.icon className="h-6 w-6 text-white" />
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-greenPrimary group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-greenPrimary transition-colors">
                          {card.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="relative">
                        <CardDescription className="text-sm text-gray-600">
                          {card.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-greenPrimary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-greenPrimary">
                Tu Salud, Nuestra Prioridad
              </CardTitle>
              <CardDescription className="text-base">
                Mantenemos tu información médica segura y accesible cuando la necesites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-greenPrimary/10">
                    <FileText className="h-5 w-5 text-greenPrimary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Resultados en línea</h4>
                    <p className="text-sm text-gray-600">
                      Accede a tus estudios y análisis desde cualquier lugar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-greenPrimary/10">
                    <Calendar className="h-5 w-5 text-greenPrimary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">Gestión de turnos</h4>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 text-xs">
                        Próximamente
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Visualiza y administra tus citas médicas fácilmente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
