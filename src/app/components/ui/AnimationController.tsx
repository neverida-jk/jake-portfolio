'use client';

import { useEffect, useRef } from 'react';

export default function AnimationController() {
  // Store the last scroll position to detect direction
  const lastScrollY = useRef(0);
  // Track elements that have been seen (animated once)
  const seenElements = useRef(new Set());

  useEffect(() => {
    // Initialize scroll position
    lastScrollY.current = window.scrollY;

    // Create an observer that tracks when elements enter/exit the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        // Get current scroll position to determine direction
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY.current;
        lastScrollY.current = currentScrollY;

        entries.forEach((entry) => {
          // When element enters viewport
          if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Mark this element as seen
                seenElements.current.add(entry.target);
          }
          // When element leaves viewport
          else {
            // Determine if element is exiting from the top or bottom
            const isExitingTop = entry.boundingClientRect.bottom <= 0;

            // If scrolling up and element is below viewport, hide it
            if (!scrollingDown && !isExitingTop) {
              entry.target.classList.remove('visible');
            }
            // If element exited from the top, keep it visible
            else if (isExitingTop) {
              entry.target.classList.add('visible');
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    // Get all elements with the reveal-item class
    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach((item) => {
      observer.observe(item);
    });

    // Cleanup function
    return () => {
      seenElements.current.clear();
      revealItems.forEach((item) => observer.unobserve(item));
      observer.disconnect();
    };
  }, []);

  return null;
}