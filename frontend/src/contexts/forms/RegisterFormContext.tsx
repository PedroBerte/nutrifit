import React, { createContext, useContext, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserProfiles, type AddressType, type UserType } from "@/types/user";
import { useAuth } from "../AuthContext";
import { useCreateUser } from "@/services/api/user";
import { useDispatch, useSelector } from "react-redux";
import { signInFromJwt } from "@/store/authSlice";
import type { RootState } from "@/store";
import { useValidateSession } from "@/services/api/auth";
import { decodeAndNormalizeJwt } from "@/lib/jwt";
import type { ProfessionalCredentialType } from "@/types/professional";
import { useCreateProfessionalCredentials } from "@/services/api/professional";

export type AccountType = "student" | "nutritionist" | "personal";

const formSchema = z.object({
  accountType: z.enum(["student", "nutritionist", "personal"]),
  image: z.string().url().optional().or(z.literal("")),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Celular deve ter pelo menos 8 dígitos"),
  search: z.enum(["nutritionist", "personal", "both"]).optional(),
  personalServiceModality: z.enum(["in_person", "online", "both"]).optional(),
  nutritionistServiceModality: z
    .enum(["in_person", "online", "both"])
    .optional(),
  zip: z.string().min(8, "CEP inválido").optional(),
  street: z.string().min(2, "Rua obrigatória").optional(),
  number: z.string().min(1, "Número obrigatório").optional(),
  complement: z.string().optional(),
  district: z.string().min(2, "Bairro obrigatório").optional(),
  city: z.string().min(2, "Cidade obrigatória").optional(),
  state: z.string().min(2, "UF obrigatória").optional(),
  country: z.string().min(2, "País obrigatório").optional(),
  addressType: z.enum(["residential", "commercial"]).optional(),
  idType: z.enum(["CRN", "CREF", "OUTRO"]).optional(),
  credential: z.string().min(3, "Credencial obrigatória").optional(),
  biography: z.string().max(500, "Máximo 500 caracteres").optional(),
  goal: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof formSchema>;

type RegisterStep = "choose" | "generic" | "address" | "professional" | "quiz";

type Ctx = {
  form: UseFormReturn<RegisterFormValues>;
  step: RegisterStep;
  accountType?: AccountType;
  setAccountType: (t: AccountType) => void;
  handleSubmitAll: () => Promise<void>;
  setStep: (s: RegisterStep) => void;
};

const RegisterFormContext = createContext<Ctx | undefined>(undefined);

export function RegisterFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [sp] = useSearchParams();

  const [step, setStep] = useState<RegisterStep>("choose");
  const [accountType, setAccountTypeState] = useState<AccountType>("student");

  const { user } = useAuth();
  const createUser = useCreateUser();
  const validationSession = useValidateSession();
  const createProfessionalCredentials = useCreateProfessionalCredentials();

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
        biography: "",
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
      biography: "",
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
  };

  const handleSubmitAll = async () => {
    if (!user || !user.email) navigate("/login", { replace: true });

    if (accountType === "student") {
      const ok = await form.trigger(["image", "name", "phone"]);
      if (!ok) return;

      const payload = form.getValues();

      var newUser: UserType = {
        id: null,
        addressId: null,
        profileId: UserProfiles.STUDENT,
        name: payload.name,
        email: user?.email || "",
        address: null,
        profile: null,
      };

      await handleCreateEntity(newUser);

      navigate("/home", { replace: true });
      return;
    }

    if (accountType === "nutritionist" || accountType === "personal") {
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

      var newAddress: AddressType = {
        id: null,
        addressLine: payload.street || "",
        number: payload.number || "",
        city: payload.city || "",
        state: payload.state || "",
        zipCode: payload.zip || "",
        country: payload.country || "",
        addressType: payload.addressType === "residential" ? 1 : 2,
      };

      var newUser: UserType = {
        id: null,
        profileId:
          payload.accountType === "nutritionist"
            ? UserProfiles.NUTRITIONIST
            : UserProfiles.PERSONAL,
        name: payload.name,
        email: user?.email || "",
        address: newAddress,
      };

      var newUserCredentials: ProfessionalCredentialType = {
        id: null,
        professionalId: "",
        status: "P",
        type: payload.idType || "CRN",
        credentialId: payload.credential || "",
        biography: payload.biography || null,
      };

      await handleCreateEntity(newUser, newUserCredentials, accountType);
    }
    navigate("/home", { replace: true });
  };

  async function handleCreateEntity(
    user: UserType,
    professionalCredentials?: ProfessionalCredentialType,
    accountType?: AccountType
  ) {
    try {
      const linkToken = sp.get("token");
      if (!linkToken) {
        console.error("Missing link token in URL");
        navigate("/login?err=missing-token", { replace: true });
        return;
      }

      var newUser = await createUser.mutateAsync(user);

      if (!newUser || !newUser.id) {
        console.error("User creation failed");
        navigate("/login", { replace: true });
        return;
      }

      if (accountType === "nutritionist" || accountType === "personal") {
        if (professionalCredentials) {
          professionalCredentials.professionalId = newUser.id;

          await createProfessionalCredentials.mutateAsync(
            professionalCredentials
          );
        }
      }

      const jwt = await validationSession.mutateAsync(linkToken);

      const decoded = decodeAndNormalizeJwt(jwt);
      const ok =
        !!decoded?.id &&
        !!decoded?.email &&
        typeof decoded?.expMs === "number" &&
        decoded.expMs > Date.now();

      if (!ok) {
        navigate("/login?err=invalid-link", { replace: true });
        return;
      }

      dispatch(signInFromJwt({ accessToken: jwt! }));
    } catch (error) {
      console.error("Failed to create user:", error);
      navigate("/login", { replace: true });
      return;
    }
  }

  const value: Ctx = {
    form,
    step,
    accountType,
    setAccountType,
    handleSubmitAll,
    setStep,
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
