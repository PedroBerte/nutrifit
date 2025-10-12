import { useAuth } from "@/contexts/AuthContext";
import { UserProfiles } from "@/types/user";
import React from "react";
import PersonalHome from "./PersonalHome";
import StudentHome from "./StudentHome";

export default function Home() {
  const { user, logout } = useAuth();

  if (user?.profile == UserProfiles.PERSONAL) return <PersonalHome />;
  if (user?.profile == UserProfiles.STUDENT) return <StudentHome />;
}
