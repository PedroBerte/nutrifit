import PhotoUploader from "@/components/photoUploader";
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
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const userRegisterSchema = z.object({
  image: z.url().optional(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Celular deve ter pelo menos 8 dígitos"),
});

export default function GenericFirstRegister() {
  const registerForm = useForm<z.infer<typeof userRegisterSchema>>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: { image: "", name: "", phone: "" },
  });

  const onSubmit = async (data: z.infer<typeof userRegisterSchema>) => {
    console.log(data);
  };

  return (
    <div className="flex w-full h-full items-center justify-center flex-col">
      <Form {...registerForm}>
        <form
          onSubmit={registerForm.handleSubmit(onSubmit)}
          className="flex gap-4 flex-col w-full max-w-sm"
        >
          <FormField
            control={registerForm.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <PhotoUploader
                  onUpload={(file) => {
                    const url = URL.createObjectURL(file);
                    registerForm.setValue("image", url);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mt-5">
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={registerForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celular</FormLabel>
                <FormControl>
                  <Input placeholder="(99) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-2 mt-3">
            <Button className="flex-1" variant="dark">
              Voltar
            </Button>
            <Button className="flex-1">Próximo</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
