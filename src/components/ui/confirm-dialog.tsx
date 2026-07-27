"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HiExclamationCircle } from "react-icons/hi";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
        <DialogHeader className="border-b border-[#222222] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-[#E61919]/10">
              <HiExclamationCircle className="h-4 w-4 text-[#E61919]" />
            </div>
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="font-mono text-[11px] text-[#777777] pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="-mx-4 -mb-4 flex flex-row gap-2 rounded-b-xl border-t bg-[#0D0D0D] p-4 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-none border-[#333333] bg-[#111111] font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] h-9"
          >
            CANCELAR
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-none bg-[#E61919] font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515] h-9"
          >
            {loading ? "[ PROCESSANDO... ]" : "CONFIRMAR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
