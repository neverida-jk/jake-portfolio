export type Testimonial = {
  /** Their words, exactly as they gave them. Never write or edit one for them. */
  quote: string;
  name: string;
  /** Their role, e.g. "Engineering Lead". */
  role: string;
  /** Where we worked together, e.g. "Vertere Global Solutions". */
  org: string;
  /** Year or "Month Year" we worked together. */
  when: string;
};

// Real quotes only, from real people who agreed to be quoted. The section
// stays hidden until there is at least one entry — an empty or invented
// testimonial is worse than none. To add one, append an object to `items`.
export const testimonials = {
  title: "What people say",
  items: [] as Testimonial[],
};
