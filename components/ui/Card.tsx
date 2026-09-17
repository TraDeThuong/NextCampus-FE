import React, { type HTMLAttributes, type ReactNode } from "react";

export type CardVariant = "glass" | "interactive" | "outline" | "solid";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

export default function Card({
  children,
  variant = "glass",
  className = "",
  ...props
}: CardProps) {
  const variantStyles: Record<CardVariant, string> = {
    glass: "bg-card border border-border shadow-glass backdrop-blur-xl",
    interactive:
      "bg-card border border-border shadow-glass backdrop-blur-xl hover:-translate-y-1 hover:border-border-strong hover:shadow-soft transition-all duration-300 cursor-pointer",
    outline: "bg-transparent border border-border",
    solid: "bg-card border-none shadow-soft",
  };

  return (
    <div
      className={`relative rounded-2xl text-foreground overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pb-2 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base sm:text-lg font-semibold tracking-wide text-foreground ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-muted ${className}`} {...props}>
      {children}
    </p>
  );
}

function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 sm:p-6 pt-0 flex items-center justify-end gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
