import LoginComponent from "@/components/Login";
import useUserRole from "@/hooks/useRoles";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
function LoginPage() {
  const navigate = useNavigate();
  const { session } = useUserRole();

  useEffect(() => {
    if (session) {
      navigate("/inicio");
    }
  }, [session, navigate]);

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión</title>
        <meta
          name="description"
          content="Inicia sesión en el Portal de Incor Centro Médico."
        />
      </Helmet>
      <LoginComponent />;
    </>
  );
}

export default LoginPage;
