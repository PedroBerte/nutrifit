import AddressForm from "@/components/forms/AddressForm";
import ChooseAccountForm from "@/components/forms/ChooseAccountForm";
import GenericPersonForm from "@/components/forms/GenericPersonForm";
import ProfissionalForm from "@/components/forms/ProfissionalForm";
import QuizForm from "@/components/forms/QuizForm";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  useRegisterForm,
  type RegisterStep,
} from "@/contexts/forms/RegisterFormContext";
import { AnimatePresence, motion } from "framer-motion";

export default function FirstAccess() {
  const {
    step,
    setStep,
    form,
    accountType,
    handleSubmitAll,
    handleValidateStep,
    isLoadingSubmit,
  } = useRegisterForm();

  function renderForm() {
    switch (step) {
      case "choose":
        return <ChooseAccountForm />;
      case "generic":
        return <GenericPersonForm />;
      case "address":
        return <AddressForm />;
      case "quiz":
        return accountType === "student" ? <QuizForm /> : null;
      case "professional":
        return <ProfissionalForm />;
      default:
        return null;
    }
  }

  function renderButtons() {
    switch (step) {
      case "generic":
        return (
          <div className="flex w-full gap-2 justify-between">
            <Button
              variant="dark"
              onClick={() => setStep("choose")}
              className="flex flex-1"
              type="button"
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="flex flex-1"
              onClick={async () => await handleNextStep("address")}
            >
              Próximo
            </Button>
          </div>
        );
      case "quiz":
        return (
          <div className="flex w-full gap-2 justify-between">
            <Button
              variant="dark"
              onClick={() => setStep("address")}
              className="flex flex-1"
              type="button"
            >
              Voltar
            </Button>
            <Button
              className="flex flex-1"
              onClick={() => handleSubmitAll()}
              disabled={isLoadingSubmit}
              type="button"
            >
              Finalizar
            </Button>
          </div>
        );
      case "address":
        if (accountType === "student") {
          return (
            <div className="flex w-full  gap-2 justify-between">
              <Button
                variant="dark"
                onClick={() => setStep("generic")}
                className="flex flex-1"
                type="button"
              >
                Voltar
              </Button>
              <Button
                className="flex flex-1"
                onClick={async () => await handleNextStep("quiz")}
                type="button"
              >
                Próximo
              </Button>
            </div>
          );
        } else {
          return (
            <div className="flex w-full  gap-2 justify-between">
              <Button
                variant="dark"
                onClick={() => setStep("generic")}
                className="flex flex-1"
                type="button"
              >
                Voltar
              </Button>
              <Button
                className="flex flex-1"
                onClick={async () => await handleNextStep("professional")}
                type="button"
              >
                Próximo
              </Button>
            </div>
          );
        }
      case "professional":
        return (
          <div className="flex w-full gap-2 justify-between">
            <Button
              variant="dark"
              onClick={() => setStep("address")}
              type="button"
              className="flex flex-1"
            >
              Voltar
            </Button>
            <Button
              className="flex flex-1"
              onClick={() => handleSubmitAll()}
              disabled={isLoadingSubmit}
              type="button"
            >
              Finalizar
            </Button>
          </div>
        );
      default:
        return null;
    }
  }

  function renderTitle() {
    switch (step) {
      case "generic":
        return <p className="text-xl font-bold">Sobre você</p>;
      case "address":
        return <p className="text-xl font-bold">Seu Endereço</p>;
      case "professional":
        return <p className="text-xl font-bold">Dados Profissionais</p>;
      case "quiz":
        return <Navbar isMenuButtonVisible={false} />;
    }
  }

  async function handleNextStep(nextStep: RegisterStep) {
    if (await handleValidateStep()) setStep(nextStep);
  }

  return (
    <div className="flex flex-col flex-1">
      <Form {...form}>
        <form onSubmit={handleSubmitAll} className="flex flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              className="flex flex-1 justify-between flex-col gap-6"
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderTitle()}
              {renderForm()}
              {renderButtons()}
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}
