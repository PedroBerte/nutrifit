import { ConstructionIcon } from "lucide-react";
import React from "react";
import { motion } from "motion/react";

export default function Diet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col gap-2 items-center justify-center"
    >
      <ConstructionIcon />
      <p>Em construção...</p>
    </motion.div>
  );
}
