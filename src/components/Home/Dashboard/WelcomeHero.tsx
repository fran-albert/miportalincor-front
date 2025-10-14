import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface WelcomeHeroProps {
  name: string;
}

export const WelcomeHero = ({ name }: WelcomeHeroProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("es-ES", options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-greenPrimary to-teal-600 p-8 text-white shadow-lg"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6" />
          <span className="text-lg font-medium opacity-90">{getGreeting()}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          ¡Bienvenido, {name}!
        </h1>
        <p className="text-white/80 text-sm sm:text-base capitalize">
          {getCurrentDate()}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
    </motion.div>
  );
};
