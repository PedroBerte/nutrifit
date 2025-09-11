import AddressForm from "@/components/forms/AddressForm";
import ChooseAccountForm from "@/components/forms/ChooseAccountForm";
import GenericPersonForm from "@/components/forms/GenericPersonForm";
import ProfissionalForm from "@/components/forms/ProfissionalForm";
import QuizForm from "@/components/forms/QuizForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";
import type { RootState } from "@/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function FirstAccess() {
  const { step, setStep, form, accountType, handleSubmitAll } =
    useRegisterForm();

  function renderForm() {
    switch (step) {
      case "choose":
        return <ChooseAccountForm />;
      case "generic":
        return <GenericPersonForm />;
      default:
        switch (accountType) {
          case "student":
            return <QuizForm />;
          default:
            switch (step) {
              case "address":
                return <AddressForm />;
              case "professional":
                return <ProfissionalForm />;
            }
        }
    }
  }

  function renderButtons() {
    switch (step) {
      case "generic":
        return accountType === "student" ? (
          <div className="flex flex-1 gap-2 justify-between">
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
              onClick={() => setStep("quiz")}
            >
              Próximo
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 gap-2 justify-between">
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
              onClick={() => setStep("address")}
            >
              Próximo
            </Button>
          </div>
        );
      case "quiz":
        return (
          <div className="flex flex-1 gap-2 justify-between">
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
              onClick={() => handleSubmitAll()}
              type="button"
            >
              Finalizar
            </Button>
          </div>
        );
      case "address":
        return (
          <div className="flex flex-1 gap-2 justify-between">
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
              onClick={() => setStep("professional")}
              type="button"
            >
              Próximo
            </Button>
          </div>
        );
      case "professional":
        return (
          <div className="flex flex-1 gap-2 justify-between">
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
              type="button"
            >
              Finalizar
            </Button>
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col flex-1 justify-center">
      <Form {...form}>
        <form onSubmit={handleSubmitAll} className="flex flex-col gap-6">
          {renderForm()}
          {renderButtons()}
        </form>
      </Form>
    </div>
  );
}
