import type { LucideProps } from "lucide-react";
import {
  Calendar,
  Check,
  Circle,
  Copy,
  House,
  Image,
  LogOut,
  MessageCircle,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import type { SVGProps } from "react";

type IconProps = LucideProps;

function plate(props: IconProps): LucideProps {
  return {
    strokeWidth: 1.6,
    absoluteStrokeWidth: true,
    "aria-hidden": true,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return <House {...plate(props)} />;
}

export function CalendarIcon(props: IconProps) {
  return <Calendar {...plate(props)} />;
}

export function PhotoIcon(props: IconProps) {
  return <Image {...plate(props)} />;
}

export function ChatIcon(props: IconProps) {
  return <MessageCircle {...plate(props)} />;
}

export function ProfileIcon(props: IconProps) {
  return <User {...plate(props)} />;
}

export function CheckIcon(props: IconProps) {
  return <Check {...plate(props)} />;
}

export function CrossIcon(props: IconProps) {
  return <X {...plate(props)} />;
}

export function PendingIcon(props: IconProps) {
  return <Circle {...plate(props)} />;
}

export function AcknowledgeIcon(props: IconProps) {
  return <ThumbsUp {...plate(props)} />;
}

export function CommentIcon(props: IconProps) {
  return <MessageCircle {...plate(props)} />;
}

export function CopyIcon(props: IconProps) {
  return <Copy {...plate(props)} />;
}

export function LogoutIcon(props: IconProps) {
  return <LogOut {...plate(props)} />;
}

export function SpoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      overflow="visible"
      {...props}
    >
      <ellipse cx="12" cy="7.2" rx="3.3" ry="3.5" />
      <ellipse cx="12" cy="7.1" rx="1.4" ry="1.7" />
      <path d="M12 10.8v7" strokeWidth={1.9} />
      <path d="M10.6 17.8c.4.9 1 1.3 1.4 1.3s1-.4 1.4-1.3" />
    </svg>
  );
}
