import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastContext";
import { useSendAccessEmail } from "@/services/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteStudentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteStudentDrawer({
  open,
  onOpenChange,
}: InviteStudentDrawerProps) {
  const toast = useToast();
  const { user } = useAuth();
  const { mutate: sendAccessEmail, isPending } = useSendAccessEmail();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: InviteFormData) => {
    if (!user?.id) {
      toast.error("Erro ao identificar usuário");
      return;
    }

    sendAccessEmail(
      {
        email: data.email,
        invited: true,
        professionalInviterId: user.id,
      },
      {
        onSuccess: () => {
          toast.success("Convite enviado com sucesso!");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Erro ao enviar convite. Tente novamente."
          );
        },
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Convidar Novo Aluno</DrawerTitle>
          <DrawerDescription>
            Digite o email do aluno que você deseja convidar. Ele receberá um
            link para criar a conta e será automaticamente vinculado a você.
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Aluno</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="aluno@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DrawerFooter className="flex-shrink-0 px-4 border-t bg-background">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Convite"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
