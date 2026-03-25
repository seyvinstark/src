"use client";

import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function Draggable({
  id,
  disabled,
  children,
  className,
}: {
  id: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : undefined,
    cursor: disabled ? "not-allowed" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={className}>
      {children}
    </div>
  );
}

export function Droppable({
  id,
  disabled,
  children,
  className,
  active,
  invalid,
}: {
  id: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  invalid?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  const ring = isOver ? (invalid ? "ring-2 ring-red-500/30" : "ring-2 ring-blue-500/30") : "";
  const bg = isOver ? (invalid ? "bg-red-50" : "bg-blue-50") : "";
  const activeRing = active ? "ring-1 ring-blue-500/20" : "";

  return (
    <div ref={setNodeRef} className={`${className ?? ""} ${ring} ${bg} ${activeRing}`}>
      {children}
    </div>
  );
}

