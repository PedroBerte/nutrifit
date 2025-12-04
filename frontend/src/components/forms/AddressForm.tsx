import React, { useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";
import { useViaCep } from "@/services/viacep";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MaskedInput } from "../MaskedInput";
import { formatCEP } from "@/lib/mask";
import { brazilianStates } from "@/lib/states";
import { Combobox } from "@/components/Combobox";

export default function AddressForm() {
  const { form } = useRegisterForm();
  const cep = form.watch("zip") ?? "";
  const { data, isFetching, isError } = useViaCep(
    cep,
    !!cep && cep.replace(/\D/g, "").length === 8
  );

  useEffect(() => {
    if (data) {
      form.setValue("street", data.logradouro || "");
      form.setValue("district", data.bairro || "");
      form.setValue("city", data.localidade || "");
      form.setValue("state", data.uf || "");
      form.trigger(["street", "district", "city", "state"]);
    }
  }, [data, form]);

  return (
    <div className="flex flex-col w-full gap-4">
      <FormField
        name="zip"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <MaskedInput
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="00000-000"
                formatter={formatCEP}
              />
            </FormControl>
            {isFetching && (
              <span className="text-xs text-muted">Buscando endereço...</span>
            )}
            {isError && (
              <span className="text-xs text-red-500">CEP não encontrado</span>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="street"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rua</FormLabel>
            <FormControl>
              <Input placeholder="Rua das Dietas" maxLength={255} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="number"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input
                placeholder="123"
                maxLength={20}
                inputMode="numeric"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="district"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro</FormLabel>
            <FormControl>
              <Input placeholder="Centro" maxLength={100} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="city"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input placeholder="São Paulo" maxLength={100} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="state"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <FormControl>
              <Combobox
                options={brazilianStates}
                placeholder="Selecione o estado"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="country"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>País</FormLabel>
            <FormControl>
              <Input disabled placeholder="Brasil" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="addressType"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Endereço</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de endereço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
