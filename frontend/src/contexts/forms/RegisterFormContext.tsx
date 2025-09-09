import React, { createContext, useContext, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

export type AccountType = "student" | "nutritionist" | "personal";

const baseSchema = z.object({
  image: z.string().url().optional().or(z.literal("")),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Celular deve ter pelo menos 8 dígitos"),
});

const addressSchema = z.object({
  zip: z.string().min(8, "CEP inválido"),
  street: z.string().min(2, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  district: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "UF obrigatória"),
  country: z.string().min(2, "País obrigatório"),
  addressType: z.enum(["residential", "commercial"]).optional(),
});

const professionalDataSchema = z.object({
  idType: z.enum(["CRN", "CREF", "OUTRO"]),
  credential: z.string().min(3, "Credencial obrigatória"),
  biography: z.string().max(500, "Máximo 500 caracteres").optional(),
});

const quizSchema = z.object({
  search: z.enum(["nutritionist", "personal", "both"]).optional(),
  personalServiceModality: z.enum(["in_person", "online", "both"]).optional(),
  nutritionistServiceModality: z
    .enum(["in_person", "online", "both"])
    .optional(),
});

const formSchema = z.discriminatedUnion("accountType", [
  z.object({
    accountType: z.literal("student"),
    ...baseSchema.shape,
    ...quizSchema.shape,
  }),
  z.object({
    accountType: z.literal("nutritionist"),
    ...baseSchema.shape,
    ...addressSchema.shape,
    ...professionalDataSchema.shape,
  }),
  z.object({
    accountType: z.literal("personal"),
    ...baseSchema.shape,
    ...addressSchema.shape,
    ...professionalDataSchema.shape,
  }),
]);

export type RegisterFormValues = z.infer<typeof formSchema>;

type RegisterStep = "choose" | "generic" | "address" | "professional" | "quiz";

type Ctx = {
  form: UseFormReturn<RegisterFormValues>;
  step: RegisterStep;
  accountType?: AccountType;
  setAccountType: (t: AccountType) => void;
  goNext: () => Promise<void>;
  goBack: () => void;
  handleSubmitAll: () => Promise<void>;
};

const RegisterFormContext = createContext<Ctx | undefined>(undefined);

export function RegisterFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegisterStep>("choose");
  const [accountType, setAccountTypeState] = useState<AccountType>("student");

  const defaultValues = useMemo<RegisterFormValues>(() => {
    if (accountType === "student") {
      return {
        accountType: "student",
        image: "",
        name: "",
        phone: "",
        goal: "health",
      };
    }
    if (accountType === "nutritionist") {
      return {
        accountType: "nutritionist",
        image: "",
        name: "",
        phone: "",
        zip: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        country: "Brasil",
        addressType: "residential",
        state: "",
        idType: "CRN",
        credential: "",
      };
    }
    return {
      accountType: "personal",
      image: "",
      name: "",
      phone: "",
      zip: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      country: "Brasil",
      addressType: "residential",
      idType: "CRN",
      credential: "",
    };
  }, [accountType]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const setAccountType = (t: AccountType) => {
    setAccountTypeState(t);
    form.reset({ ...defaultValues });
    setStep("generic");
    navigate("/first-access", { replace: true });
  };

  const goNext = async () => {
    switch (step) {
      case "choose":
        if (!accountType) return;
        setStep("generic");
        navigate("/first-access", { replace: true });
        break;
      case "generic":
        const t = form.getValues("accountType");
        const genericOk = await form.trigger(["image", "name", "phone"]);
        if (!genericOk) return;
        if (t === "student") {
          setStep("quiz");
          navigate("/quiz", { replace: true });
        } else {
          setStep("address");
          navigate("/address-register", { replace: true });
        }
        break;
      case "address":
        const addressOk = await form.trigger([
          "zip",
          "street",
          "number",
          "complement",
          "district",
          "city",
          "state",
          "country",
          "addressType",
        ]);
        if (!addressOk) return;
        setStep("professional");
        navigate("/professional-register", { replace: true });
        break;
    }
  };

  const goBack = () => {
    switch (step) {
      case "generic":
        setStep("choose");
        navigate("/choose-account", { replace: true });
        break;
      case "address":
        setStep("generic");
        navigate("/first-access", { replace: true });
        break;
      case "professional":
        setStep("address");
        navigate("/address-register", { replace: true });
        break;
      case "quiz":
        setStep("generic");
        navigate("/first-access", { replace: true });
        break;
      default:
        break;
    }
  };

  const handleSubmitAll = async () => {
    const t = form.getValues("accountType");

    if (t === "student") {
      const ok = await form.trigger(["image", "name", "phone"]);
      if (!ok) return;

      const payload = form.getValues();
      console.log("POST /register/student", payload);
      navigate("/home", { replace: true });
      return;
    }

    const ok = await form.trigger([
      "image",
      "name",
      "phone",
      "zip",
      "street",
      "number",
      "district",
      "city",
      "state",
      "idType",
      "credential",
    ]);
    if (!ok) return;

    const payload = form.getValues();
    const url =
      t === "nutritionist" ? "/register/nutritionist" : "/register/personal";
    console.log("POST", url, payload);
    navigate("/home", { replace: true });
  };

  const value: Ctx = {
    form,
    step,
    accountType,
    setAccountType,
    goNext,
    goBack,
    handleSubmitAll,
  };

  return (
    <RegisterFormContext.Provider value={value}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export function useRegisterForm() {
  const ctx = useContext(RegisterFormContext);
  if (!ctx)
    throw new Error("useRegisterForm must be used within RegisterFormProvider");
  return ctx;
}
