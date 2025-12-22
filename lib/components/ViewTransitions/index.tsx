'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ViewTransitions() {
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Check if browser supports View Transitions API
        if ('startViewTransition' in document) {
            // Trigger view transition animation
            (document as any).startViewTransition(() => {
                // The navigation has already happened at this point
                // This just triggers the animation
            });
        }
    }, [pathname]);

    return null;
}
