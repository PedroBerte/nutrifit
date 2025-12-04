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
import { useState, useEffect } from "react";
import { useSendAccessEmail } from "@/services/api/auth";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
});

const RESEND_COOLDOWN_SECONDS = 30;

export default function Login() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const sendEmail = useSendAccessEmail();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    await sendEmail.mutateAsync({ email: data.email });
    setSentEmail(data.email);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = async () => {
    if (sentEmail && cooldown === 0) {
      await sendEmail.mutateAsync({ email: sentEmail });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleBackToForm = () => {
    setSentEmail(null);
    setCooldown(0);
    sendEmail.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-1 items-center justify-center flex-col"
    >
      <div className="flex items-center flex-col mb-4">
        <img src={Logo} alt="Logo" className="w-40 h-40" />
        <div className="flex text-3xl font-bold">
          <p className="text-neutral-white-01">Nutri</p>
          <p className="text-primary">Fit</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!sentEmail ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onSubmit)}
                className="flex gap-3 flex-col"
              >
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

                {sendEmail.isError && (
                  <p className="text-sm text-red-500 text-center">
                    Falha ao enviar e-mail. Tente novamente.
                  </p>
                )}
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-neutral-white-01">
                  E-mail enviado!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Se existir uma conta para{" "}
                  <strong className="text-neutral-white-01">{sentEmail}</strong>,
                  você receberá um link para entrar.
                </p>
              </div>

              <div className="w-full p-4 rounded-lg bg-neutral-white-01/5 border border-neutral-white-01/10">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground text-left">
                    Verifique sua caixa de entrada e a pasta de spam.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={cooldown > 0 || sendEmail.isPending}
                  className="w-full"
                >
                  {sendEmail.isPending
                    ? "Enviando..."
                    : cooldown > 0
                    ? `Reenviar em ${cooldown}s`
                    : "Reenviar e-mail"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleBackToForm}
                  className="w-full text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Usar outro e-mail
                </Button>
              </div>

              {sendEmail.isError && (
                <p className="text-sm text-red-500">
                  Falha ao reenviar e-mail. Tente novamente.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
