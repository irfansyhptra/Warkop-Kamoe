import React from "react";
import Link from "next/link";
import Button from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "📭",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="bg-amber-50/10 backdrop-blur-xl rounded-3xl border border-amber-200/20 p-12 text-center">
      <div className="text-8xl mb-6">{icon}</div>
      <h1 className="text-3xl font-bold text-amber-50 mb-4">{title}</h1>
      <p className="text-amber-200/80 mb-8 max-w-md mx-auto">{description}</p>

      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="lg">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="lg" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;
