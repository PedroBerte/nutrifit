import React, { createContext, useContext, useMemo, useState } from "react";
import { useForm, type UseFormReturn, type Resolver } from "react-hook-form";
import { date, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserProfiles, type AddressType, type UserType } from "@/types/user";
import { useAuth } from "../AuthContext";
import { useCreateUser } from "@/services/api/user";
import { useDispatch } from "react-redux";
import { signInFromJwt, signOut } from "@/store/authSlice";
import { useValidateSession } from "@/services/api/auth";
import { decodeAndNormalizeJwt } from "@/lib/jwt";
import type { ProfessionalCredentialType } from "@/types/professional";
import { uploadImage } from "@/services/api/storage";

export type AccountType = "student" | "nutritionist" | "personal";

const formSchema = z.object({
  image: z.string().optional().or(z.literal("")), // Aceita data URL ou URL normal
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Celular deve ter pelo menos 8 dígitos"),
  sex: z.enum(["male", "female", "other"]),
  dateOfBirth: z.coerce.date("Data de nascimento obrigatória"),
  search: z.enum(["nutritionist", "personal", "both"]).optional(),
  personalServiceModality: z.enum(["in_person", "online", "both"]).optional(),
  nutritionistServiceModality: z
    .enum(["in_person", "online", "both"])
    .optional(),
  zip: z.string().min(8, "CEP inválido"),
  street: z.string().min(2, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string(),
  district: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "UF obrigatória"),
  country: z.string().min(2, "País obrigatório"),
  addressType: z.enum(["residential", "commercial"]),
  idType: z.enum(["CRN", "CREF", "OUTRO"]),
  credential: z.string().min(3, "Credencial obrigatória"),
  biography: z.string().max(500, "Máximo 500 caracteres"),
  goal: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof formSchema>;

export type RegisterStep =
  | "choose"
  | "generic"
  | "address"
  | "professional"
  | "quiz";

type Ctx = {
  form: UseFormReturn<RegisterFormValues>;
  step: RegisterStep;
  accountType?: AccountType;
  setAccountType: (t: AccountType) => void;
  handleSubmitAll: () => Promise<void>;
  setStep: (s: RegisterStep) => void;
  handleValidateStep: () => Promise<boolean>;
  setImageFile: (file: File | null) => void;
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const { user } = useAuth();
  const createUser = useCreateUser();
  const validationSession = useValidateSession();

  const defaultValues = useMemo<RegisterFormValues>(() => {
    return {
      image: "",
      name: "",
      phone: "",
      dateOfBirth: new Date(),
      sex: "male",
      goal: "health",
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
      search: undefined,
      personalServiceModality: undefined,
      nutritionistServiceModality: undefined,
    };
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema) as Resolver<RegisterFormValues>,
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const setAccountType = (t: AccountType) => {
    setAccountTypeState(t);
  };

  const handleValidateStep = async () => {
    switch (step) {
      case "generic":
        const ok = await form.trigger(["image", "name", "phone"]);
        if (!ok) return false;
        return true;
      case "address":
        const ok2 = await form.trigger([
          "zip",
          "street",
          "number",
          "district",
          "city",
          "state",
        ]);
        if (!ok2) return false;
        return true;
      case "professional":
        const ok3 = await form.trigger(["idType", "credential", "biography"]);
        if (!ok3) return false;
        return true;
      default:
        return true;
    }
  };

  const handleSubmitAll = async () => {
    try {
      if (!user || !user.email) navigate("/login", { replace: true });

      if (accountType === "student") {
        const ok = await form.trigger([
          "image",
          "name",
          "phone",
          "dateOfBirth",
          "sex",
          "zip",
          "street",
          "number",
          "district",
          "city",
          "state",
        ]);
        if (!ok) return;

        const payload = form.getValues();

        // Criar usuário SEM imagem primeiro
        var newUser: UserType = {
          id: null,
          addressId: null,
          profileId: UserProfiles.STUDENT,
          name: payload.name,
          email: user?.email || "",
          imageUrl: null, // Será preenchido depois
          dateOfBirth: payload.dateOfBirth
            ? payload.dateOfBirth.toISOString()
            : null,
          sex: payload.sex || null,
          phoneNumber: payload.phone || null,
          address: {
            id: null,
            addressLine: payload.street || "",
            number: payload.number || "",
            city: payload.city || "",
            state: payload.state || "",
            zipCode: payload.zip || "",
            country: payload.country || "Brasil",
            addressType: payload.addressType === "residential" ? 1 : 2,
          },
          profile: null,
        };

        // Criar usuário e obter GUID
        const createdUser = await handleCreateEntity(newUser);

        // Fazer upload da imagem COM o GUID do usuário
        if (selectedImageFile && createdUser?.id) {
          try {
            console.log(
              "Fazendo upload da imagem com GUID do usuário:",
              createdUser.id
            );
            const uploadResponse = await uploadImage(
              selectedImageFile,
              "profiles",
              createdUser.id // Nome do arquivo será o GUID do usuário
            );
            console.log("Upload concluído:", uploadResponse.url);

            // TODO: Atualizar usuário com a URL da imagem
            // Você pode criar um endpoint PATCH para atualizar apenas a imageUrl
            // ou deixar para atualizar na próxima edição de perfil
          } catch (uploadError) {
            console.error("Erro ao fazer upload da imagem:", uploadError);
            // Usuário já foi criado, apenas log do erro
            console.warn("Usuário criado mas imagem não foi enviada");
          }
        }

        navigate("/home", { replace: true });
        return;
      }

      if (accountType === "nutritionist" || accountType === "personal") {
        const ok = await form.trigger([
          "image",
          "name",
          "phone",
          "dateOfBirth",
          "sex",
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

        // Criar usuário profissional SEM imagem primeiro
        var newUser: UserType = {
          id: null,
          profileId:
            accountType === "nutritionist"
              ? UserProfiles.NUTRITIONIST
              : UserProfiles.PERSONAL,
          name: payload.name,
          email: user?.email || "",
          imageUrl: null, // Será preenchido depois
          dateOfBirth: payload.dateOfBirth
            ? payload.dateOfBirth.toISOString()
            : null,
          sex: payload.sex || null,
          phoneNumber: payload.phone || null,
          address: {
            id: null,
            addressLine: payload.street || "",
            number: payload.number || "",
            city: payload.city || "",
            state: payload.state || "",
            zipCode: payload.zip || "",
            country: payload.country || "Brasil",
            addressType: payload.addressType === "residential" ? 1 : 2,
          },
          professionalCredential: {
            id: null,
            professionalId: null,
            status: "P",
            type: payload.idType || "CRN",
            credentialId: payload.credential || "",
            biography: payload.biography || null,
          },
        };

        // Criar usuário e obter GUID
        const createdUser = await handleCreateEntity(newUser);

        // Fazer upload da imagem COM o GUID do usuário
        if (selectedImageFile && createdUser?.id) {
          try {
            console.log(
              "Fazendo upload da imagem com GUID do usuário:",
              createdUser.id
            );
            const uploadResponse = await uploadImage(
              selectedImageFile,
              "profiles",
              createdUser.id // Nome do arquivo será o GUID do usuário
            );
            console.log("Upload concluído:", uploadResponse.url);

            // TODO: Atualizar usuário com a URL da imagem
            // Você pode criar um endpoint PATCH para atualizar apenas a imageUrl
            // ou deixar para atualizar na próxima edição de perfil
          } catch (uploadError) {
            console.error("Erro ao fazer upload da imagem:", uploadError);
            // Usuário já foi criado, apenas log do erro
            console.warn("Usuário criado mas imagem não foi enviada");
          }
        }
      }
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Failed to submit form:", error);
      signOut();
      navigate("/login", { replace: true });
    }
  };

  async function handleCreateEntity(user: UserType): Promise<UserType> {
    try {
      const linkToken = sp.get("token");
      if (!linkToken) {
        console.error("Missing link token in URL");
        navigate("/login?err=missing-token", { replace: true });
        throw new Error("Missing link token");
      }

      console.log("Creating user with data:", user);

      var newUser = await createUser.mutateAsync(user);

      if (!newUser || !newUser.id) {
        console.error("User creation failed");
        navigate("/login", { replace: true });
        throw new Error("User creation failed");
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
        throw new Error("Invalid session");
      }

      dispatch(signInFromJwt({ accessToken: jwt! }));

      return newUser; // Retornar o usuário criado
    } catch (error) {
      console.error("Failed to create user:", error);
      navigate("/login", { replace: true });
      throw error;
    }
  }

  const value: Ctx = {
    form,
    step,
    accountType,
    setAccountType,
    handleSubmitAll,
    setStep,
    handleValidateStep,
    setImageFile: setSelectedImageFile,
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
