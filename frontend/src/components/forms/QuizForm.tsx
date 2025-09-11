import React from "react";
import { FormField, FormItem } from "../ui/form";
import { Button } from "../ui/button";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";

export default function QuizForm() {
  const { form } = useRegisterForm();

  const searchOptions = [
    { label: "Nutricionista", value: "nutritionist" },
    { label: "Personal", value: "personal" },
    { label: "Ambos", value: "both" },
  ];

  const modalityOptions = [
    { label: "Presencial", value: "in_person" },
    { label: "Online", value: "online" },
    { label: "Híbrido", value: "both" },
  ];

  return (
    <div className="flex flex-col flex-1 gap-8 mt-6">
      <section className="flex flex-col gap-1">
        <div>
          <p className="text-2xl font-bold">Seja bem-vindo!</p>
          <p className="text-2xl font-bold">Nos conte mais sobre você.</p>
        </div>
        <p className="text-xs text-neutral-white-02">
          As respostas serão usadas para guiar suas preferências e identificar
          profissionais alinhados com suas expectativas. Essas preferências
          podem ser atualizadas depois.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <p>O que você procura?</p>
              <div className="w-full flex flex-row gap-3">
                {searchOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    className={`flex-1 ${
                      field.value === opt.value ? "" : "bg-secondary"
                    }`}
                    onClick={() => field.onChange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personalServiceModality"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <p>Modalidade de atendimento de personal</p>
              <div className="w-full flex flex-row gap-3">
                {modalityOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    className={`flex-1 ${
                      field.value === opt.value ? "" : "bg-secondary"
                    }`}
                    onClick={() => field.onChange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nutritionistServiceModality"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <p>Modalidade de atendimento de nutricionista</p>
              <div className="w-full flex flex-row gap-3">
                {modalityOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    className={`flex-1 ${
                      field.value === opt.value ? "" : "bg-secondary"
                    }`}
                    onClick={() => field.onChange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
