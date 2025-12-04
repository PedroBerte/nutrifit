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
import InputMask from "@mona-health/react-input-mask";
import { MaskedInput } from "../MaskedInput";
import { formatPhoneBR } from "@/lib/mask";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function GenericPersonForm() {
  const { form, setImageFile } = useRegisterForm();
  return (
    <div className="flex flex-col w-full gap-4">
      <FormField
        control={form.control}
        name="image"
        render={() => (
          <FormItem>
            <PhotoUploader
              initialImageUrl={form.getValues("image") || undefined}
              onFileSelect={(file) => {
                // Armazena o arquivo no contexto para upload posterior
                setImageFile(file);
                // Cria preview local para o formulário
                const reader = new FileReader();
                reader.onloadend = () => {
                  form.setValue("image", reader.result as string, {
                    shouldValidate: true,
                  });
                };
                reader.readAsDataURL(file);
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
              <Input placeholder="Seu Nome" maxLength={200} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="sex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sexo</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
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
              <MaskedInput
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="(11) 91234-5678"
                formatter={formatPhoneBR}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-transparent",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd/MM/yyyy")
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
