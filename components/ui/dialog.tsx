"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

/* ── Overlay ────────────────────────────────────────────── */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:[animation:overlay-show_0.2s_ease-out]",
      "data-[state=closed]:[animation:overlay-hide_0.15s_ease-in]",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/* ── Content – bottom sheet on mobile, centred modal on md+ ── */
interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideClose?: boolean;
  showHandle?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideClose = false, showHandle = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        /* shared */
        "fixed z-50 bg-[var(--card)] text-[var(--foreground)] shadow-2xl outline-none",
        "overflow-y-auto scrollbar-thin",
        /* ── mobile: bottom sheet ── */
        "bottom-0 left-0 right-0 rounded-t-3xl max-h-[92svh]",
        "data-[state=open]:[animation:sheet-slide-up_0.35s_cubic-bezier(0.32,0.72,0,1)]",
        "data-[state=closed]:[animation:sheet-slide-down_0.25s_cubic-bezier(0.32,0.72,0,1)]",
        /* ── desktop: centred modal ── */
        "md:bottom-auto md:left-1/2 md:top-1/2 md:right-auto",
        "md:-translate-x-1/2 md:-translate-y-1/2",
        "md:rounded-2xl md:max-h-[85vh] md:w-full md:max-w-lg",
        "md:data-[state=open]:[animation:dialog-zoom-in_0.2s_ease-out]",
        "md:data-[state=closed]:[animation:dialog-zoom-out_0.15s_ease-in]",
        className
      )}
      {...props}
    >
      {/* Drag handle – mobile only */}
      {showHandle && (
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-[var(--card-border)]" />
        </div>
      )}

      {children}

      {!hideClose && (
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/* ── Sub-components ─────────────────────────────────────── */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-2 px-6 pb-6 pt-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-tight text-[var(--foreground)]", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogSrTitle = ({ children }: { children: React.ReactNode }) => (
  <VisuallyHidden.Root asChild>
    <DialogPrimitive.Title>{children}</DialogPrimitive.Title>
  </VisuallyHidden.Root>
);

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogSrTitle,
};
