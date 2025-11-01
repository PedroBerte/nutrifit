import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";
import PersonalHome from "./PersonalHome";
import Workout from "./Workout";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.profile == UserProfiles.PERSONAL)
      navigate("/personal", { replace: true });
    if (user?.profile == UserProfiles.STUDENT)
      navigate("/workout", { replace: true });
  }, [user]);

  return <div>Redirecionando...</div>;
}
