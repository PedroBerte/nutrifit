import React from "react";
import PhotoUploader from "../photoUploader";
import {
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormControl,
} from "../ui/form";
import { Input } from "../ui/input";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";

export default function GenericPersonForm() {
  const { form } = useRegisterForm();
  return (
    <div className="flex flex-col w-full gap-4">
      <FormField
        control={form.control}
        name="image"
        render={() => (
          <FormItem>
            <PhotoUploader
              onUpload={(file) => {
                const url = URL.createObjectURL(file);
                form.setValue("image", url, { shouldValidate: true });
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
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
        control={form.control}
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
    </div>
  );
}
