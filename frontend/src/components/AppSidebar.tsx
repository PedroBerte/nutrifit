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
} from "lucide-react";

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
import { DropdownMenuItemIndicator } from "@radix-ui/react-dropdown-menu";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";

const items = [
  {
    title: "Início",
    url: "/home",
    icon: Home,
  },
  {
    title: "Treinos",
    url: "/workout",
    icon: Dumbbell,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const getFirstUserName = (name: string | null) => {
    if (!name) return "Usuário";
    return name.split(" ")[0];
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
          <section className="flex flex-row justify-between mb-4 p-2 text-sm w-full">
            <p>Olá, {getFirstUserName(user && user.name)} 👋🏻</p>
            <ArrowRightFromLine size={20} onClick={() => toggleSidebar()} />
          </section>
          <SidebarGroupLabel>Ir para:</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user && user.name ? user.name : "Usuário"}{" "}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-popper-anchor-width] border-border/5"
              >
                <DropdownMenuItem onClick={() => handleProfileClick()}>
                  <p className="">Ver meu perfil</p>
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem
                  className="flex flex-row justify-between text-red-500"
                  onClick={handleLogout}
                >
                  <p>Sair</p>
                  <LogOut color="red" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
