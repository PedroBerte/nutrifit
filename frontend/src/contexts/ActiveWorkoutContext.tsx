import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetActiveWorkoutSession, type WorkoutSessionResponse } from "@/services/api/workoutSession";

interface ActiveWorkoutContextData {
  activeSession: WorkoutSessionResponse | null;
  isLoading: boolean;
  isValidating: boolean;
  cancelWorkout: () => void;
  refreshActiveSession: () => void;
  clearActiveSession: () => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextData | undefined>(undefined);

interface ActiveWorkoutProviderProps {
  children: React.ReactNode;
}

export function ActiveWorkoutProvider({ children }: ActiveWorkoutProviderProps) {
  const queryClient = useQueryClient();
  const [isCancelled, setIsCancelled] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const { 
    data: activeSessionResponse, 
    isLoading: isQueryLoading,
    refetch 
  } = useGetActiveWorkoutSession();

  console.log("[CONTEXT] useGetActiveWorkoutSession executado:", activeSessionResponse);

  // BLOQUEIA refetch quando há cancelamento ativo
  useEffect(() => {
    if (isCancelled) {
      console.log("[CONTEXT] Cancelamento ativo - desabilitando refetch");
      queryClient.setQueryDefaults(["getActiveWorkoutSession"], {
        enabled: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false
      });
    } else {
      console.log("[CONTEXT] Reabilitando refetch");
      queryClient.setQueryDefaults(["getActiveWorkoutSession"], {
        enabled: true,
        refetchOnWindowFocus: true,
        refetchOnMount: true
      });
    }
  }, [isCancelled, queryClient]);

  // Força override do cache quando há cancelamento
  useEffect(() => {
    if (isCancelled) {
      console.log("[CONTEXT] Forçando override do cache");
      queryClient.setQueryData(["getActiveWorkoutSession"], {
        success: true,
        message: "Nenhuma sessão ativa",  
        data: null
      });
    }
  }, [isCancelled, queryClient]);

  // Estado derivado: sessão ativa válida
  const activeSession = React.useMemo(() => {
    console.log("[CONTEXT] Calculando activeSession - isCancelled:", isCancelled, "response:", activeSessionResponse);
    if (isCancelled) {
      return null;
    }
    if (!activeSessionResponse?.success) {
      return null;
    }
    return activeSessionResponse.data || null;
  }, [activeSessionResponse, isCancelled]);

  // Força invalidação global quando há cancelamento
  useEffect(() => {
    if (isCancelled) {
      // Força todos os hooks existentes a retornarem null
      queryClient.setQueryData(["getActiveWorkoutSession"], {
        success: true,
        message: "Nenhuma sessão ativa",
        data: null
      });
      
      // Invalida para forçar refetch
      queryClient.invalidateQueries({ queryKey: ["getActiveWorkoutSession"] });
    }
  }, [isCancelled, queryClient]);

  // Função para cancelar treino (chamada pelos componentes)
  const cancelWorkout = useCallback(() => {
    console.log("[CONTEXT] cancelWorkout chamado - bloqueando refetch");
    setIsCancelled(true);
    setIsValidating(true);
    
    // Limpa cache imediatamente
    queryClient.setQueryData(["getActiveWorkoutSession"], {
      success: true,
      message: "Nenhuma sessão ativa",
      data: null
    });
    
    // Remove queries relacionadas
    queryClient.removeQueries({ queryKey: ["getWorkoutSessionById"] });
    queryClient.removeQueries({ queryKey: ["getActiveWorkoutSession"] });
    
    // Marca como cancelado no localStorage para persistência
    localStorage.setItem("workoutCancelled", "true");
    
    // Remove flag após um tempo MAIOR para evitar refetch prematuro
    setTimeout(() => {
      console.log("[CONTEXT] Removendo flag após timeout longo");
      setIsCancelled(false);
      setIsValidating(false);
      localStorage.removeItem("workoutCancelled");
    }, 5000); // Aumentado para 5 segundos
  }, [queryClient]);

  // Função para forçar refresh
  const refreshActiveSession = useCallback(async () => {
    setIsValidating(true);
    await refetch();
    setIsValidating(false);
  }, [refetch]);

  // Função para limpar sessão manualmente
  const clearActiveSession = useCallback(() => {
    setIsCancelled(true);
    queryClient.setQueryData(["getActiveWorkoutSession"], {
      success: true,
      message: "Nenhuma sessão ativa",
      data: null
    });
  }, [queryClient]);

  // Recupera estado de cancelamento do localStorage ao montar
  useEffect(() => {
    const wasCancelled = localStorage.getItem("workoutCancelled");
    if (wasCancelled === "true") {
      setIsCancelled(true);
      // Remove após um tempo se ainda existir
      setTimeout(() => {
        setIsCancelled(false);
        localStorage.removeItem("workoutCancelled");
      }, 1000);
    }
  }, []);

  // Monitora mudanças no localStorage constantemente
  useEffect(() => {
    const checkCancellation = () => {
      const wasCancelled = localStorage.getItem("workoutCancelled");
      if (wasCancelled === "true" && !isCancelled) {
        setIsCancelled(true);
      }
    };

    // Polling mais agressivo
    const interval = setInterval(checkCancellation, 100);
    return () => clearInterval(interval);
  }, [isCancelled]);

  // Escuta eventos de cancelamento
  useEffect(() => {
    const handleWorkoutCancelled = () => {
      setIsCancelled(true);
      // Remove a flag após um tempo
      setTimeout(() => {
        setIsCancelled(false);
        localStorage.removeItem("workoutCancelled");
      }, 2000);
    };

    const handleFocus = () => {
      const wasCancelled = localStorage.getItem("workoutCancelled");
      if (wasCancelled === "true") {
        setIsCancelled(true);
      }
    };

    window.addEventListener("workoutCancelled", handleWorkoutCancelled);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("workoutCancelled", handleWorkoutCancelled);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const contextValue: ActiveWorkoutContextData = {
    activeSession,
    isLoading: isQueryLoading || isValidating,
    isValidating,
    cancelWorkout,
    refreshActiveSession,
    clearActiveSession,
  };

  return (
    <ActiveWorkoutContext.Provider value={contextValue}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext);
  if (context === undefined) {
    throw new Error("useActiveWorkout must be used within an ActiveWorkoutProvider");
  }
  return context;
}