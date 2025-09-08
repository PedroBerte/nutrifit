import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";

export default function Quiz() {
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
            name="goal"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seu objetivo</FormLabel>
                <FormControl>
                  <select
                    className="w-full h-10 rounded-md bg-background border px-3"
                    {...field}
                  >
                    <option value="lose_weight">Perder peso</option>
                    <option value="gain_mass">Ganhar massa</option>
                    <option value="health">Saúde geral</option>
                  </select>
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
