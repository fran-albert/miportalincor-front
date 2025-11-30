import { Building2, Users, UserCog, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";

export default function LaboralIncorComponent() {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral" },
  ];

  const quickAccessCards = [
    {
      title: "Empresas",
      description:
        "Gestiona empresas y clientes corporativos del centro médico",
      icon: Building2,
      href: "/incor-laboral/empresas",
    },
    {
      title: "Colaboradores",
      description: "Gestiona colaboradores y exámenes preocupacionales",
      icon: Users,
      href: "/incor-laboral/colaboradores",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* PageHeader */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Incor Laboral"
        description="Sistema de gestión para colaboradores y empresas"
        icon={<UserCog className="h-6 w-6" />}
      />

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickAccessCards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link to={card.href}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden group">
                <CardContent className="p-8">
                  {/* Icon Circle */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <card.icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {card.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="flex items-center text-greenPrimary group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm font-semibold">Acceder</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
