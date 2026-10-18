"use client";

import { useId, useState } from "react";

interface ReadMoreProps {
    html: string;
    className?: string;
}

/**
 * Texto longo (descrição da Stays) com "ler mais": mostra as primeiras linhas
 * com um esmaecimento no fim e expande no toque.
 *
 * O corte só existe quando o JS já assumiu a página (`html[data-reveal]`,
 * definido pelo ScrollObserver). Sem JS o texto fica inteiro visível.
 */
export function ReadMore({ html, className = "" }: ReadMoreProps) {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <div>
            <div
                id={id}
                data-open={open ? "true" : undefined}
                className={[
                    "relative overflow-hidden transition-[max-height] duration-300 ease-out max-h-[400rem]",
                    "[html[data-reveal]_&:not([data-open])]:max-h-56",
                    className,
                ].join(" ")}
            >
                <div dangerouslySetInnerHTML={{ __html: html }} />
                {!open && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-16 bg-gradient-to-t from-background to-transparent [html[data-reveal]_&]:block" />
                )}
            </div>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={id}
                className="mt-2 hidden min-h-11 items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-primary-light [html[data-reveal]_&]:inline-flex"
            >
                {open ? "Mostrar menos" : "Ler a descrição completa"}
            </button>
        </div>
    );
}
