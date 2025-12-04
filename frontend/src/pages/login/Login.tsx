import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSendAccessEmail } from "@/services/api/auth";
import { motion } from "motion/react";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
});

export default function Login() {
  const [sent, setSent] = useState<string | null>(null);
  const sendEmail = useSendAccessEmail();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    await sendEmail.mutateAsync({ email: data.email });
    setSent(data.email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-1 items-center justify-center flex-col"
    >
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(onSubmit)}
          className="flex gap-2 flex-col w-full max-w-sm"
        >
          <div className="flex items-center flex-col">
            <img src={Logo} alt="Logo" className="w-40 h-40" />
            <div className="flex text-3xl font-bold">
              <p className="text-neutral-white-01">Nutri</p>
              <p className="text-primary">Fit</p>
            </div>
          </div>

          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    maxLength={255}
                    placeholder="seu.email@email.com.br"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={sendEmail.isPending}>
            {sendEmail.isPending ? "Enviando..." : "Enviar e-mail de acesso"}
          </Button>

          {sent && (
            <p className="text-sm text-muted-foreground">
              Se existir uma conta para <strong>{sent}</strong>, você receberá
              um link para entrar.
            </p>
          )}

          {sendEmail.isError && (
            <p className="text-sm text-red-500">
              Falha ao enviar e-mail. Tente novamente.
            </p>
          )}
        </form>
      </Form>
    </motion.div>
  );
}
