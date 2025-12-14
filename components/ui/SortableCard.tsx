import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

interface SortableCardProps {
  id: number;
  children: React.ReactNode;
  mode?: "default" | "table"; // card or table mode
  className?: string;
  sortId?: number;
}

function SortableCard({
  id,
  children,
  mode = "default",
  className,
  sortId
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  if (mode === "table") {
    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={clsx(isDragging && "bg-gray-100", className)}
      >
        <td
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="!p-1 cursor-grab active:cursor-grabbing flex-center gap-5"
        >
          {/* Drag icon */}
          <svg width="16" height="16" fill="gray">
            <circle cx="4" cy="4" r="2" />
            <circle cx="12" cy="4" r="2" />
            <circle cx="4" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          {sortId || id}
        </td>

        {/* Render the rest of the row cells */}
        {children}
      </tr>
    );
  }

  // Default card mode
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute top-2 end-1 z-10 bg-white p-1 rounded-md shadow cursor-grab active:cursor-grabbing"
      >
        <svg width="16" height="16" fill="gray">
          <circle cx="4" cy="4" r="2" />
          <circle cx="12" cy="4" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
      {children}
    </div>
  );
}

export default SortableCard;
