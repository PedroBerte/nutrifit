import { Routes, Route, Navigate } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
import { RoleGuard } from "./RoleGuard";
import { UserProfiles } from "@/types/user";
import Login from "@/pages/login/Login";
import Callback from "@/pages/login/CallbackLogin";
import Home from "@/pages/Home";
import AppDefaultLayout from "./layouts/AppDefaultLayout";
import RegisterFormLayout from "./layouts/RegisterFormLayout";
import FirstAccess from "@/pages/FirstAccess";
import Profile from "@/pages/Profile";
import Professional from "@/pages/Professional";
import Workout from "@/pages/Workout";
import Students from "@/pages/Students";
import StudentDetails from "@/pages/StudentDetails";
import Diet from "@/pages/Diet";
import Bond from "@/pages/Bond";
import RoutinesList from "@/pages/RoutinesList";
import NewRoutine from "@/pages/NewRoutine";
import RoutineDetails from "@/pages/RoutineDetails";
import { NewWorkoutTemplate } from "@/pages/NewWorkoutTemplate";
import { EditWorkoutTemplate } from "@/pages/EditWorkoutTemplate";
import WorkoutSession from "@/pages/WorkoutSession";
import WorkoutSessionDetails from "@/pages/WorkoutSessionDetails";
import ProfessionalsList from "@/pages/ProfessionalsList";
import PersonalHome from "@/pages/PersonalHome";
import ExerciseHistory from "@/pages/ExerciseHistory";
import { Appointments } from "@/pages/Appointments";
import ProfessionalAgenda from "@/pages/ProfessionalAgenda";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="home" replace />} />

        <Route path="login" element={<Login />} />
        <Route path="login/callback" element={<Callback />} />

        <Route element={<RegisterFormLayout />}>
          <Route path="first-access" element={<FirstAccess />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route element={<AppDefaultLayout />}>
            {/* Shared Routes - Both profiles can access */}
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="diet" element={<Diet />} />

            {/* Student-Only Routes */}
            <Route
              path="workout"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.STUDENT]}>
                  <Workout />
                </RoleGuard>
              }
            />
            <Route
              path="workout/session/:templateId"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.STUDENT]}>
                  <WorkoutSession />
                </RoleGuard>
              }
            />
            <Route
              path="exercise/:exerciseId/history"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.STUDENT]}>
                  <ExerciseHistory />
                </RoleGuard>
              }
            />
            <Route
              path="appointments"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.STUDENT]}>
                  <Appointments />
                </RoleGuard>
              }
            />
            <Route
              path="professionalsList"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.STUDENT]}>
                  <ProfessionalsList />
                </RoleGuard>
              }
            />
            <Route
              path="professional/:id"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.STUDENT]}>
                  <Professional />
                </RoleGuard>
              }
            />

            {/* Professional-Only Routes */}
            <Route
              path="personal"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <PersonalHome />
                </RoleGuard>
              }
            />
            <Route
              path="agenda"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <ProfessionalAgenda />
                </RoleGuard>
              }
            />
            <Route
              path="students"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <Students />
                </RoleGuard>
              }
            />
            <Route
              path="students/:id"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <StudentDetails />
                </RoleGuard>
              }
            />
            <Route
              path="students/:id/workouts/:sessionId"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <WorkoutSessionDetails />
                </RoleGuard>
              }
            />
            <Route
              path="bond"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <Bond />
                </RoleGuard>
              }
            />
            <Route
              path="routines"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <RoutinesList />
                </RoleGuard>
              }
            />
            <Route
              path="routines/new"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <NewRoutine />
                </RoleGuard>
              }
            />
            <Route
              path="routines/:routineId"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <RoutineDetails />
                </RoleGuard>
              }
            />
            <Route
              path="routines/:routineId/workouts/new"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <NewWorkoutTemplate />
                </RoleGuard>
              }
            />
            <Route
              path="routines/:routineId/workouts/:templateId"
              element={
                <RoleGuard allowedProfiles={[UserProfiles.PERSONAL]}>
                  <EditWorkoutTemplate />
                </RoleGuard>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
