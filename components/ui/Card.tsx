import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6",
                glow && "shadow-lg shadow-violet-500/10",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("mb-4", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("text-lg font-bold text-white", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("text-slate-300", className)} {...props}>
            {children}
        </div>
    );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-sm text-slate-400", className)} {...props}>
            {children}
        </p>
    );
}
