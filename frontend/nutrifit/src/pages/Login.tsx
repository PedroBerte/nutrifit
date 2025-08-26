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
import { zodResolver } from "@hookform/resolvers/zod/src/index.js";
import { useForm } from "react-hook-form";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
});

export default function Login() {
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    console.log(data);
  };

  return (
    <div className="flex w-full h-full items-center justify-center flex-col">
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(onSubmit)}
          className="flex gap-4 flex-col w-full max-w-sm"
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
                  <Input placeholder="seu.email@email.com.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Enviar e-mail de acesso</Button>
        </form>
      </Form>
    </div>
  );
}
