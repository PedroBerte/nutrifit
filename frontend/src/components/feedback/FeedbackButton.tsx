import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "./FeedbackModal";

interface FeedbackButtonProps {
  professionalId: string;
  professionalName: string;
  professionalImageUrl?: string;
  customerId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function FeedbackButton({
  professionalId,
  professionalName,
  professionalImageUrl,
  customerId,
  variant = "outline",
  size = "default",
  className = "",
  children,
}: FeedbackButtonProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowFeedbackModal(true)}
        className={className}
      >
        {children || (
          <>
            <Star className="h-4 w-4 mr-2" />
            Avaliar
          </>
        )}
      </Button>

      <FeedbackModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
        professionalId={professionalId}
        professionalName={professionalName}
        professionalImageUrl={professionalImageUrl}
        customerId={customerId}
      />
    </>
  );
}
