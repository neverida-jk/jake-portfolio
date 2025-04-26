'use client';

import { useEffect, useRef } from 'react';

export default function AnimationController() {
  // Store the last scroll position to detect direction
  const lastScrollY = useRef(0);
  // Track elements that have been seen
  const seenElements = useRef(new Set());

  useEffect(() => {
    // Initialize scroll position
    lastScrollY.current = window.scrollY;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Get current scroll position to determine direction
        const currentScrollY = window.scrollY;
        const scrollingUp = currentScrollY < lastScrollY.current;
        lastScrollY.current = currentScrollY;
        
        entries.forEach((entry) => {
          // When element enters viewport
          if (entry.isIntersecting) {
            // If scrolling up or element was already seen, make it instantly visible
            if (scrollingUp || seenElements.current.has(entry.target)) {
              entry.target.classList.add('visible');
            } 
            // When scrolling down and seeing element for first time, animate it
            else {
              requestAnimationFrame(() => {
                // Remove any existing animation classes
                entry.target.classList.remove('visible');
                
                // Force a reflow to ensure the removal takes effect
                void (entry.target as HTMLElement).offsetWidth;
                
                // Apply standard animation
                entry.target.classList.add('visible');
                
                // Mark this element as seen
                seenElements.current.add(entry.target);
              });
            }
          } 
          // When element leaves viewport
          else {
            requestAnimationFrame(() => {
              // Remove animation classes
              entry.target.classList.remove('visible');
            });
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

    return () => {
      seenElements.current.clear();
      revealItems.forEach((item) => observer.unobserve(item));
      observer.disconnect();
    };
  }, []);

  return null;
}