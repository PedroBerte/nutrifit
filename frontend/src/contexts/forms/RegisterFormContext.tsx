import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useForm, type UseFormReturn, type Resolver } from "react-hook-form";
import { z } from "zod";
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
import { useToast } from "../ToastContext";
import { useCreateBond } from "@/services/api/bond";
import { api } from "@/lib/axios";

export type AccountType = "student" | "nutritionist" | "personal";

const MIN_AGE = 18;

function calculateAge(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
}

const formSchema = z.object({
  image: z.string().optional().or(z.literal("")), // Aceita data URL ou URL normal
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Celular deve ter pelo menos 8 dígitos"),
  sex: z.enum(["male", "female", "other"]),
  dateOfBirth: z.coerce
    .date({ message: "Data de nascimento obrigatória" })
    .refine((date) => calculateAge(date) > MIN_AGE, {
      message: `Você precisa ter pelo menos ${MIN_AGE} anos`,
    }),
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
  isLoadingSubmit?: boolean;
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
  const toast = useToast();

  const [sp] = useSearchParams();

  const [step, setStep] = useState<RegisterStep>("choose");
  const [accountType, setAccountTypeState] = useState<AccountType>("student");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

  const { user } = useAuth();
  const createUser = useCreateUser();
  const validationSession = useValidateSession();
  const createBond = useCreateBond();

  // Verificar se é um convite ao carregar
  useEffect(() => {
    const inviteDataStr = sessionStorage.getItem("inviteData");
    if (inviteDataStr) {
      try {
        const inviteData = JSON.parse(inviteDataStr);
        if (inviteData.invited) {
          setAccountTypeState("student");
          setStep("generic"); // Pular seleção de tipo de conta
        }
      } catch (e) {
        console.error("Erro ao ler dados de convite:", e);
      }
    }
  }, []);

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
        const ok = await form.trigger([
          "image",
          "name",
          "phone",
          "dateOfBirth",
        ]);
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

        setIsLoadingSubmit(true);

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

            // Atualizar usuário com a URL da imagem
            await api.put(`/user/${createdUser.id}`, {
              ...createdUser,
              imageUrl: uploadResponse.url,
            });
            console.log("Imagem do usuário atualizada com sucesso!");
          } catch (uploadError) {
            console.error("Erro ao fazer upload da imagem:", uploadError);
            // Usuário já foi criado, apenas log do erro
            console.warn("Usuário criado mas imagem não foi enviada");
          }
        }

        navigate("/home", { replace: true });
        setIsLoadingSubmit(false);
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

        setIsLoadingSubmit(true);

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

            // Atualizar usuário com a URL da imagem
            await api.put(`/user/${createdUser.id}`, {
              ...createdUser,
              imageUrl: uploadResponse.url,
            });
            console.log("Imagem do usuário atualizada com sucesso!");
          } catch (uploadError) {
            console.error("Erro ao fazer upload da imagem:", uploadError);
            // Usuário já foi criado, apenas log do erro
            console.warn("Usuário criado mas imagem não foi enviada");
            toast.warning("Perfil criado, mas a imagem não pôde ser enviada");
          }
        }
      }
      toast.success("Cadastro realizado com sucesso!");
      setIsLoadingSubmit(false);
      navigate("/home", { replace: true });
    } catch (error: any) {
      console.error("Failed to submit form:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar cadastro";
      toast.error(errorMessage);
      signOut();
      setIsLoadingSubmit(false);
      navigate("/login", { replace: true });
    } finally {
      setIsLoadingSubmit(false);
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

      // Se for convite, criar vínculo automaticamente
      const inviteDataStr = sessionStorage.getItem("inviteData");
      if (inviteDataStr && newUser?.id) {
        try {
          const inviteData = JSON.parse(inviteDataStr);
          if (inviteData.invited && inviteData.professionalInviterId) {
            console.log(
              "Criando vínculo automático com professional:",
              inviteData.professionalInviterId
            );
            await createBond.mutateAsync({
              id: null,
              customerId: newUser.id,
              professionalId: inviteData.professionalInviterId,
              senderId: inviteData.professionalInviterId,
              status: "A", // Aceito automaticamente
              customer: null,
              professional: null,
              sender: null,
            });
            console.log("Vínculo criado com sucesso!");
            // Limpar dados de convite
            sessionStorage.removeItem("inviteData");
          }
        } catch (bondError) {
          console.error("Erro ao criar vínculo automático:", bondError);
          // Não falhar o cadastro se o vínculo falhar
          toast.warning(
            "Usuário criado, mas houve um problema ao criar o vínculo com o profissional"
          );
        }
      }

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
    isLoadingSubmit,
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
