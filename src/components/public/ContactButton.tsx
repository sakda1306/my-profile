// The gradient "Contact me" pill used in the hero and the About section.
export function ContactButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="contact-pill inline-block whitespace-nowrap rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest transition hover:brightness-110 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
    >
      {label}
    </a>
  );
}
