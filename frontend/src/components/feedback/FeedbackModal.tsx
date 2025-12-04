import { useState } from "react";
import { Star } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarImage } from "@/components/ui/avatar-image";
import { toast } from "sonner";
import { useCreateFeedback, useGetBondFeedback } from "@/services/api/feedback";
import { Loader2 } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  professionalName: string;
  professionalImageUrl?: string;
  customerId: string;
}

export function FeedbackModal({
  open,
  onOpenChange,
  professionalId,
  professionalName,
  professionalImageUrl,
  customerId,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [testimony, setTestimony] = useState("");

  const createFeedbackMutation = useCreateFeedback();
  const { data: existingFeedback, isLoading: loadingExisting } = useGetBondFeedback(
    customerId,
    professionalId
  );

  // Set existing feedback data when modal opens
  useState(() => {
    if (existingFeedback && open) {
      setRating(existingFeedback.rate);
      setTestimony(existingFeedback.testimony || "");
    } else if (!open) {
      // Reset when modal closes
      setRating(0);
      setTestimony("");
    }
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    try {
      await createFeedbackMutation.mutateAsync({
        professionalId,
        customerId,
        rate: rating,
        testimony: testimony.trim() || undefined,
      });

      toast.success(
        existingFeedback
          ? "Avaliação atualizada com sucesso!"
          : "Avaliação enviada com sucesso!"
      );
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erro ao enviar avaliação. Tente novamente."
      );
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <div className="mx-auto w-full max-w-md flex flex-col overflow-hidden">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>
              {existingFeedback ? "Atualizar Avaliação" : "Avaliar Profissional"}
            </DrawerTitle>
            <DrawerDescription>
              Compartilhe sua experiência com {professionalName}
            </DrawerDescription>
          </DrawerHeader>

          {loadingExisting ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto px-4 space-y-6 py-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
            {/* Professional Info */}
            <div className="flex items-center gap-3 p-3 bg-neutral-dark-02/50 rounded-lg border border-neutral-white-01/10">
              <AvatarImage
                imageUrl={professionalImageUrl}
                name={professionalName}
                size="md"
              />
              <div>
                <h4 className="font-semibold text-neutral-white-01">
                  {professionalName}
                </h4>
                <p className="text-sm text-neutral-white-02">
                  Avalie o profissional
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-white-01">
                Avaliação *
              </label>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-primary text-primary"
                          : "text-neutral-white-02"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-neutral-white-02">
                  {rating === 1 && "Muito insatisfeito"}
                  {rating === 2 && "Insatisfeito"}
                  {rating === 3 && "Neutro"}
                  {rating === 4 && "Satisfeito"}
                  {rating === 5 && "Muito satisfeito"}
                </p>
              )}
            </div>

            {/* Testimony */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-white-01">
                Depoimento (opcional)
              </label>
              <Textarea
                placeholder="Compartilhe detalhes sobre sua experiência..."
                value={testimony}
                onChange={(e) => setTestimony(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-neutral-white-02 text-right">
                {testimony.length}/500 caracteres
              </p>
            </div>
          </div>
        )}

        <DrawerFooter className="flex-shrink-0 gap-2">
          <Button
            onClick={handleSubmit}
            disabled={createFeedbackMutation.isPending || loadingExisting}
            className="w-full"
          >
            {createFeedbackMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : existingFeedback ? (
              "Atualizar"
            ) : (
              "Enviar Avaliação"
            )}
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              disabled={createFeedbackMutation.isPending}
              className="w-full"
            >
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
