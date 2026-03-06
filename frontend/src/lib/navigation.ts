/**
 * Mapeamento de rotas para navegação "voltar" inteligente.
 * Em vez de usar navigate(-1) que rebobina o histórico,
 * cada rota sabe para qual rota pai deve voltar.
 */

 type RoutePattern = {
  pattern: RegExp;
  getParent: (match: RegExpMatchArray, userProfile?: string | null) => string;
};

/**
 * Define os padrões de rota e seus pais.
 * A ordem importa - padrões mais específicos devem vir primeiro.
 */
const routePatterns: RoutePattern[] = [
  // Student routes
  {
    // /workout/session/:templateId -> /workout
    pattern: /^\/workout\/session\/[^/]+$/,
    getParent: () => "/workout",
  },
  {
    // /exercise/:exerciseId/history -> volta para sessão se existe, senão /workout
    pattern: /^\/exercise\/[^/]+\/history$/,
    getParent: () => {
      // Verifica se há uma sessão de treino ativa para retornar
      const returnToSession = sessionStorage.getItem('returnToWorkoutSession');
      if (returnToSession) {
        sessionStorage.removeItem('returnToWorkoutSession');
        return `/workout/session/${returnToSession}`;
      }
      return "/workout";
    },
  },
  {
    // /professional/:id -> /professionalsList ou /myProfessionals
    pattern: /^\/professional\/[^/]+$/,
    getParent: () => "/professionalsList",
  },

  // Professional routes - mais específicos primeiro
  {
    // /students/:id/workouts/:sessionId -> /students/:id
    pattern: /^\/students\/([^/]+)\/workouts\/[^/]+$/,
    getParent: (match) => `/students/${match[1]}`,
  },
  {
    // /students/:id -> /students
    pattern: /^\/students\/[^/]+$/,
    getParent: () => "/students",
  },
  {
    // /routines/:routineId/workouts/new -> /routines/:routineId
    pattern: /^\/routines\/([^/]+)\/workouts\/new$/,
    getParent: (match) => `/routines/${match[1]}`,
  },
  {
    // /routines/:routineId/workouts/:templateId -> /routines/:routineId
    pattern: /^\/routines\/([^/]+)\/workouts\/[^/]+$/,
    getParent: (match) => `/routines/${match[1]}`,
  },
  {
    // /routines/new -> /routines
    pattern: /^\/routines\/new$/,
    getParent: () => "/routines",
  },
  {
    // /routines/:routineId -> /routines
    pattern: /^\/routines\/[^/]+$/,
    getParent: () => "/routines",
  },
  {
    // /routines -> /home
    pattern: /^\/routines$/,
    getParent: () => "/home",
  },
  {
    // /students -> /home
    pattern: /^\/students$/,
    getParent: () => "/home",
  },
  {
    // /bond -> /home
    pattern: /^\/bond$/,
    getParent: () => "/home",
  },
  {
    // /agenda -> /home
    pattern: /^\/agenda$/,
    getParent: () => "/home",
  },

  // Shared routes
  {
    // /profile -> /home
    pattern: /^\/profile$/,
    getParent: () => "/home",
  },
  {
    // /diet -> /home
    pattern: /^\/diet$/,
    getParent: () => "/home",
  },
  {
    // /appointments -> /workout (student)
    pattern: /^\/appointments$/,
    getParent: () => "/workout",
  },
  {
    // /professionalsList -> /workout
    pattern: /^\/professionalsList$/,
    getParent: () => "/workout",
  },
  {
    // /myProfessionals -> /workout
    pattern: /^\/myProfessionals$/,
    getParent: () => "/workout",
  },
];

/**
 * Retorna a rota pai para a rota atual.
 * Se não encontrar um padrão, retorna a home baseada no perfil do usuário.
 */
export function getParentRoute(
  currentPath: string,
  userProfile?: string | null
): string {
  for (const { pattern, getParent } of routePatterns) {
    const match = currentPath.match(pattern);
    if (match) {
      return getParent(match, userProfile);
    }
  }

  // Fallback: volta para a home do perfil
  return "/home";
}
