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
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";

export default function GenericFirstRegister() {
  const { form, goNext, goBack } = useRegisterForm();

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

          <div className="flex flex-row gap-2 mt-3">
            <Button
              className="flex-1"
              variant="dark"
              type="button"
              onClick={goBack}
            >
              Voltar
            </Button>
            <Button className="flex-1" type="button" onClick={goNext}>
              Próximo
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
