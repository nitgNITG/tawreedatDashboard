interface PillProps {
  text: string;
  color?: string;
}

export default function Pill({ text, color }: PillProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        color ? "" : "bg-gray-100 text-gray-800"
      }`}
      style={
        color
          ? {
              backgroundColor: `${color}15`,
              color,
            }
          : undefined
      }
    >
      {text}
    </span>
  );
}
