"use client";

import { useEffect } from "react";

/**
 * Marca o <html> com `data-reveal="on"` quando o JavaScript já assumiu a
 * página. Usado por componentes que só devem recolher conteúdo com JS ativo
 * (por exemplo, o "ler mais" da descrição da unidade).
 *
 * A revelação dos blocos `.reveal` ao rolar é feita só com CSS (animação
 * ligada à rolagem, ver globals.css). Antes este componente adicionava
 * classe e depois atributo nos blocos via IntersectionObserver; como ele
 * hidrata antes da página, o React acusava diferença de hidratação.
 * O <html> tem suppressHydrationWarning, então marcar só ele é seguro.
 */
export function ScrollObserver() {
    useEffect(() => {
        document.documentElement.dataset.reveal = "on";
    }, []);

    return null;
}
