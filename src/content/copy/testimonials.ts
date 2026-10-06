export type Testimonial = {
  /** Their words, exactly as they gave them. Never write or edit one for them. */
  quote: string;
  /** Optional: add only if they agreed to be named. */
  name?: string;
  /** Their role, e.g. "Project Manager". */
  role: string;
  /** Where we worked together, e.g. "UPLB Computer Science project". */
  org: string;
  /** Optional: year or "Month Year" we worked together. */
  when?: string;
};

// Real quotes only, from real people who agreed to be quoted. The section
// stays hidden when this list is empty — an empty or invented testimonial is
// worse than none. To add one, append an object to `items`.
export const testimonials = {
  title: "What people say",
  items: [
    {
      quote:
        "Jake has been great to work with as our backend lead. He’s dependable, takes ownership, and is quick to figure things out when challenges come up. I’d gladly work with him again.",
      role: "Project Manager",
      org: "UPLB Computer Science project",
    },
    {
      quote:
        "Jake is a reliable and proactive teammate who learns quickly and takes ownership of his work. Great to work with and someone I’d recommend.",
      role: "Teammate",
      org: "Vertere Global Solutions",
    },
  ] as Testimonial[],
};
