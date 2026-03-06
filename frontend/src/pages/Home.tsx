import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";
import PersonalHome from "./PersonalHome";
import StudentHome from "./StudentHome";
import { Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { useGetUserById } from "@/services/api/user";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: userData, isLoading } = useGetUserById(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const profile = (userData?.profile?.id ?? user?.profile) as UserProfiles | undefined;

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        Redirecionando...
      </motion.div>
    );
  }

  if (profile === UserProfiles.PERSONAL) {
    return <PersonalHome />;
  }

  if (profile === UserProfiles.NUTRITIONIST) {
    return <Navigate to="/agenda" replace />;
  }

  // STUDENT, SELF_MANAGED → new home page
  return <StudentHome />;
}
