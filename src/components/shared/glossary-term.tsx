"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";

export function GlossaryTerm({ term }: { term: string }) {
  const definition = GLOSSARY[term] ?? GLOSSARY[term.toLowerCase()];
  if (!definition) return <span>{term}</span>;

  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center gap-0.5 border-b border-dashed border-muted-foreground/30 cursor-help">
        {term}
        <HelpCircle className="w-3 h-3 text-muted-foreground/40" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[280px] text-[12px] leading-relaxed">
        <p className="font-semibold mb-0.5">{term}</p>
        <p className="text-muted-foreground">{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}
