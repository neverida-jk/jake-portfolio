'use client';

import { useEffect } from 'react';

export default function AnimationController() {
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-item');

    // Immediately show any items already visible or above the viewport
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        item.classList.add('visible');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once revealed, keep it visible permanently so it never disappears on scroll back
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '50px 0px 50px 0px',
      }
    );

    revealItems.forEach((item) => {
      if (!item.classList.contains('visible')) {
        observer.observe(item);
      }
    });

    return () => {
      revealItems.forEach((item) => observer.unobserve(item));
      observer.disconnect();
    };
  }, []);

  return null;
}