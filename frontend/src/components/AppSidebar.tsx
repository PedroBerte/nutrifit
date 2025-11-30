import {
  ArrowRightFromLine,
  Calendar,
  ChevronUp,
  ClosedCaption,
  Dumbbell,
  Home,
  Inbox,
  LogOut,
  Search,
  Settings,
  User2,
  Users,
} from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";
import { UserProfiles } from "@/types/user";
import { useGetUserById } from "@/services/api/user";

const items = [
  {
    title: "Início",
    url: "/home",
    icon: Home,
    profiles: [
      UserProfiles.STUDENT,
      UserProfiles.PERSONAL,
      UserProfiles.NUTRITIONIST,
    ],
  },
  {
    title: "Treinos",
    url: "/workout",
    icon: Dumbbell,
    profiles: [UserProfiles.STUDENT],
  },
  {
    title: "Treinos",
    url: "/routines",
    icon: Dumbbell,
    profiles: [UserProfiles.PERSONAL],
  },
  {
    title: "Agenda",
    url: "/agenda",
    icon: Calendar,
    profiles: [UserProfiles.PERSONAL, UserProfiles.NUTRITIONIST],
  },
  {
    title: "Vínculos",
    url: "/bond",
    icon: Users,
    profiles: [UserProfiles.PERSONAL, UserProfiles.NUTRITIONIST],
  },
  {
    title: "Consultas",
    url: "/appointments",
    icon: Calendar,
    profiles: [UserProfiles.STUDENT],
  },
  {
    title: "Encontrar profissionais",
    url: "/professionalsList",
    icon: Users,
    profiles: [UserProfiles.STUDENT],
  },
  {
    title: "Meus profissionais",
    url: "/myProfessionals",
    icon: Users,
    profiles: [UserProfiles.STUDENT],
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { data: userData } = useGetUserById(user?.id);
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const getFirstUserName = (name: string | null) => {
    if (!name) return "Usuário";
    return name.split(" ")[0];
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleLogout = () => {
    toggleSidebar();
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    toggleSidebar();
    navigate("/profile");
  };

  return (
    <Sidebar side="right" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <section className="flex flex-row justify-between items-center mb-6 p-4 text-base font-medium w-full">
            <p className="text-neutral-white-01">
              Olá, {getFirstUserName(user && user.name)}
            </p>
            <button
              onClick={() => toggleSidebar()}
              className="p-2 hover:bg-neutral-dark-02 rounded-lg transition-colors"
            >
              <ArrowRightFromLine size={22} className="text-neutral-white-02" />
            </button>
          </section>
          <SidebarGroupLabel className="text-sm font-semibold text-neutral-white-02 mb-3 px-4">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items
                .filter((item) =>
                  item.profiles.includes(user?.profile as UserProfiles)
                )
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="h-12 text-base font-medium hover:bg-neutral-dark-02 rounded-xl transition-colors"
                    >
                      <a
                        href={item.url}
                        className="flex items-center gap-3 px-4"
                      >
                        <item.icon size={22} className="text-primary" />
                        <span className="text-neutral-white-01">
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-14 hover:bg-neutral-dark-02 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 w-full px-2">
                    <AvatarImage
                      imageUrl={userData?.imageUrl}
                      name={user?.name}
                      size="sm"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-neutral-white-01 truncate">
                        {user && user.name ? user.name : "Usuário"}
                      </p>
                      <p className="text-xs text-neutral-white-02">
                        Ver opções
                      </p>
                    </div>
                    <ChevronUp
                      size={18}
                      className="text-neutral-white-02 flex-shrink-0"
                    />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-popper-anchor-width] border-border/5 p-2"
              >
                <DropdownMenuItem
                  onClick={() => handleProfileClick()}
                  className="h-11 text-base font-medium cursor-pointer rounded-lg"
                >
                  <User2 size={18} className="mr-3" />
                  <p>Ver meu perfil</p>
                </DropdownMenuItem>
                <Separator className="my-2" />
                <DropdownMenuItem
                  className="h-11 text-base font-medium cursor-pointer rounded-lg text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-3" />
                  <p>Sair</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
