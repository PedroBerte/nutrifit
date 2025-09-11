import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function ProfissionalForm() {
  const { form } = useRegisterForm();
  return (
    <>
      <FormField
        name="idType"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Identificação</FormLabel>
            <FormControl>
              <Select {...field}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRN">CRN</SelectItem>
                  <SelectItem value="CREF">CREF</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="credential"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Credencial</FormLabel>
            <FormControl>
              <Input placeholder="Ex: CRN-12345" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="biography"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Biografia</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Conte-nos sobre você" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
