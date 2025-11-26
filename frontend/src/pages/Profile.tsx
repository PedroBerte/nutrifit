import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { Button } from "@/components/ui/button";
import { UserProfiles } from "@/types/user";
import { UpdateProfileDrawer } from "@/components/profile/UpdateProfileDrawer";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  LogOut,
  Dumbbell,
  Apple,
  Edit,
  VenusAndMars,
} from "lucide-react";
import { getPresignedUrl } from "@/services/api/storage";

export default function Profile() {
  const { user, logout } = useAuth();
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUserById(user?.id);
  const [profileImageUrl, setProfileImageUrl] = React.useState("");
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchProfileImage() {
      if (userData?.id) {
        const url = await getPresignedUrl(`profiles/${userData.id}.jpg`);
        console.log("Presigned URL:", url);
        setProfileImageUrl(url);
      }
    }
    fetchProfileImage();
  }, [userData?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-neutral-white-02">Carregando perfil...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">Erro ao carregar perfil</p>
      </div>
    );
  }

  const getProfileName = () => {
    switch (userData.profile?.id) {
      case UserProfiles.NUTRITIONIST:
        return "Nutricionista";
      case UserProfiles.PERSONAL:
        return "Personal Trainer";
      case UserProfiles.STUDENT:
        return "Estudante";
      default:
        return "Usuário";
    }
  };

  const getProfileIcon = () => {
    switch (userData.profile?.id) {
      case UserProfiles.NUTRITIONIST:
        return <Apple className="w-5 h-5" />;
      case UserProfiles.PERSONAL:
        return <Dumbbell className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const calculateAge = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const getSexLabel = (sex: string | null | undefined) => {
    switch (sex) {
      case "male":
        return "Masculino";
      case "female":
        return "Feminino";
      case "other":
        return "Outro";
      default:
        return "Não informado";
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-neutral-dark-01"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between my-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-xl font-semibold text-neutral-white-01">Perfil</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="sm"
            className="border-primary flex flex-row gap-2"
            onClick={() => setIsUpdateDrawerOpen(true)}
          >
            <Edit />
            Editar
          </Button>
        </motion.div>
      </motion.div>

      {userData && (
        <UpdateProfileDrawer
          open={isUpdateDrawerOpen}
          onOpenChange={setIsUpdateDrawerOpen}
          userData={userData}
          onSuccess={() => refetch()}
        />
      )}

      <div className="flex-1 overflow-y-auto flex gap-3 flex-col">
        {/* User Avatar and Basic Info */}
        <motion.div
          className="flex flex-col items-center gap-3 bg-neutral-dark-03 p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-2xl font-bold text-white">
              {userData.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
            <img
              src={profileImageUrl}
              alt=""
              className="absolute w-20 h-20 rounded-full object-cover"
            />
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-neutral-white-01">
              {userData.name}
            </h2>
            {userData.professionalCredential ? (
              <p className="text-xs text-neutral-white-02">
                {userData.professionalCredential.biography}
              </p>
            ) : (
              <motion.div
                className="flex items-center justify-center gap-1 mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                {getProfileIcon()}
                <span className="text-sm text-neutral-white-02">
                  {getProfileName()}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3 bg-neutral-dark-03 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-neutral-white-01">
            <Mail className="w-5 h-5" />
            <span className="text-sm">{userData.email}</span>
          </div>

          {userData.phoneNumber && (
            <div className="flex items-center space-x-2 text-neutral-white-01">
              <Phone className="w-5 h-5" />
              <span className="text-sm">{userData.phoneNumber}</span>
            </div>
          )}

          {userData.dateOfBirth && (
            <div className="flex items-center space-x-2 text-neutral-white-01">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">
                {formatDate(userData.dateOfBirth)}
                {calculateAge(userData.dateOfBirth) &&
                  ` • ${calculateAge(userData.dateOfBirth)} anos`}
              </span>
            </div>
          )}

          {userData.sex && (
            <div className="flex items-center space-x-2 text-neutral-white-01">
              <VenusAndMars className="w-5 h-5" />
              <span className="text-sm">{getSexLabel(userData.sex)}</span>
            </div>
          )}
        </motion.div>

        {userData.professionalCredential && (
          <motion.div
            className="bg-neutral-dark-03 rounded-lg p-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-2">
              <div>
                <span className="text-xs text-neutral-white-02 block mb-1">
                  {userData.professionalCredential.type === "CRN"
                    ? "CRN"
                    : "CREF"}
                  :
                </span>
                <p className="text-sm text-neutral-white-01">
                  {userData.professionalCredential.credentialId}
                </p>
              </div>

              {userData.professionalCredential.biography && (
                <div className="mt-3">
                  <span className="text-xs text-neutral-white-02 block mb-1">
                    Biografia:
                  </span>
                  <p className="text-sm text-neutral-white-01">
                    {userData.professionalCredential.biography}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {userData.address && (
          <motion.div
            className="bg-neutral-dark-03 rounded-lg p-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-neutral-white-02 block mb-1">
                  CEP
                </span>
                <span className="text-sm text-neutral-white-01">
                  {userData.address.zipCode || "Não informado"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-neutral-white-02 block mb-1">
                    Rua
                  </span>
                  <span className="text-sm text-neutral-white-01">
                    {userData.address.addressLine || "Não informado"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-white-02 block mb-1">
                    Número
                  </span>
                  <span className="text-sm text-neutral-white-01">
                    {userData.address.number || "Não informado"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-white-02 block mb-1">
                    Estado
                  </span>
                  <span className="text-sm text-neutral-white-01">
                    {userData.address.state || "Não informado"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-white-02 block mb-1">
                    Cidade
                  </span>
                  <span className="text-sm text-neutral-white-01">
                    {userData.address.city || "Não informado"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="text-xs text-neutral-white-02 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Conta criada em {formatDate(userData.createdAt)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button
            onClick={logout}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
