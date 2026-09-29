import { Helmet } from "react-helmet-async";
import { SignupWizard } from "@/components/Signup/SignupWizard";

function SignupPage() {
  return (
    <>
      <Helmet>
        <title>Creá tu cuenta</title>
        <meta
          name="description"
          content="Creá tu cuenta en Mi Portal de Incor Centro Médico."
        />
      </Helmet>
      <SignupWizard />
    </>
  );
}

export default SignupPage;
