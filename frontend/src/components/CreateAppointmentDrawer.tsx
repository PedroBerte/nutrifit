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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaskedInput } from "@/components/MaskedInput";
import { formatCEP } from "@/lib/mask";
import { useViaCep } from "@/services/viacep";
import { Combobox } from "@/components/Combobox";
import { brazilianStates } from "@/lib/states";
import { useCreateAppointment } from "@/services/api/appointment";
import type { CreateAppointmentRequest } from "@/types/appointment";
import { useToast } from "@/contexts/ToastContext";

const appointmentSchema = z.object({
  scheduledDate: z.string().min(1, "Data é obrigatória"),
  scheduledTime: z.string().min(1, "Hora é obrigatória"),
  type: z.enum(["PR", "ON"]),
  zip: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateAppointmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bondId: string;
}

export default function CreateAppointmentDrawer({
  open,
  onOpenChange,
  bondId,
}: CreateAppointmentDrawerProps) {
  const toast = useToast();
  const { mutate: createAppointment, isPending } = useCreateAppointment();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      type: "ON",
      country: "Brasil",
    },
  });

  const appointmentType = form.watch("type");
  const cep = form.watch("zip") ?? "";
  const {
    data: cepData,
    isFetching,
    isError,
  } = useViaCep(
    cep,
    !!cep && cep.replace(/\D/g, "").length === 8 && appointmentType === "PR"
  );

  // Auto-fill address from CEP
  if (cepData && appointmentType === "PR") {
    form.setValue("street", cepData.logradouro || "");
    form.setValue("city", cepData.localidade || "");
    form.setValue("state", cepData.uf || "");
  }

  const onSubmit = (data: AppointmentFormData) => {
    const scheduledAt = new Date(
      `${data.scheduledDate}T${data.scheduledTime}:00`
    ).toISOString();

    const payload: CreateAppointmentRequest = {
      customerProfessionalBondId: bondId,
      scheduledAt,
      type: data.type,
    };

    if (data.type === "PR" && data.zip) {
      payload.address = {
        zipCode: data.zip,
        addressLine: data.street || "",
        number: data.number || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "Brasil",
        type: "commercial",
      };
    }

    createAppointment(payload, {
      onSuccess: () => {
        toast.success("Agendamento criado com sucesso!");
        form.reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "Erro ao criar agendamento. Tente novamente."
        );
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Novo Agendamento</DrawerTitle>
          <DrawerDescription>
            Agende uma consulta com seu aluno
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  name="scheduledDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="scheduledTime"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tipo */}
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Consulta</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ON">Online</SelectItem>
                          <SelectItem value="PR">Presencial</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Endereço (apenas se presencial) */}
              {appointmentType === "PR" && (
                <>
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
                          <span className="text-xs text-muted">
                            Buscando endereço...
                          </span>
                        )}
                        {isError && (
                          <span className="text-xs text-red-500">
                            CEP não encontrado
                          </span>
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
                          <Input placeholder="Rua das Consultas" {...field} />
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
                          <Input placeholder="123" {...field} />
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
                          <Input placeholder="São Paulo" {...field} />
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
                </>
              )}
            </div>

            <DrawerFooter className="flex-shrink-0 px-4 border-t">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Criando..." : "Criar Agendamento"}
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
