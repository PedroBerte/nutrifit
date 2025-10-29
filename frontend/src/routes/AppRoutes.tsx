import { Routes, Route, Navigate } from "react-router-dom";
import App from "@/App";
import { PrivateRoute } from "./PrivateRoute";
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
import Diet from "@/pages/Diet";
import Bond from "@/pages/Bond";
import RoutinesList from "@/pages/RoutinesList";
import NewRoutine from "@/pages/NewRoutine";
import RoutineDetails from "@/pages/RoutineDetails";
import { NewWorkoutTemplate } from "@/pages/NewWorkoutTemplate";
import { EditWorkoutTemplate } from "@/pages/EditWorkoutTemplate";
import WorkoutSession from "@/pages/WorkoutSession";

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
            <Route path="home" element={<Home />} />
            <Route path="workout" element={<Workout />} />
            <Route
              path="workout/session/:templateId"
              element={<WorkoutSession />}
            />
            <Route path="profile" element={<Profile />} />
            <Route path="professional/:id" element={<Professional />} />
            <Route path="students" element={<Students />} />
            <Route path="diet" element={<Diet />} />
            <Route path="bond" element={<Bond />} />
            <Route path="routines" element={<RoutinesList />} />
            <Route path="routines/new" element={<NewRoutine />} />
            <Route path="routines/:routineId" element={<RoutineDetails />} />
            <Route
              path="routines/:routineId/workouts/new"
              element={<NewWorkoutTemplate />}
            />
            <Route
              path="routines/:routineId/workouts/:templateId"
              element={<EditWorkoutTemplate />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
