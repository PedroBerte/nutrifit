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
import { Textarea } from "@/components/ui/textarea";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";

export default function ProfessionalRegister() {
  const { form, handleSubmitAll, goBack } = useRegisterForm();

  return (
    <div className="flex w-full h-full items-center justify-center flex-col">
      <Form {...form}>
        <form
          className="flex gap-4 flex-col w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FormField
            name="idType"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Identificação</FormLabel>
                <FormControl>
                  <select
                    className="w-full h-10 rounded-md bg-background border px-3"
                    {...field}
                  >
                    <option value="CRN">CRN</option>
                    <option value="CREF">CREF</option>
                    <option value="OUTRO">Outro</option>
                  </select>
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

          <div className="flex flex-row gap-2 mt-3">
            <Button
              className="flex-1"
              variant="dark"
              type="button"
              onClick={goBack}
            >
              Voltar
            </Button>
            <Button className="flex-1" type="button" onClick={handleSubmitAll}>
              Finalizar cadastro
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
