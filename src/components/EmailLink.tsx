import { LinkArrow, type LinkArrowProps } from "./LinkArrow";
import { emailDisplay, emailHref } from "../lib/email";

/**
 * EmailLink: a LinkArrow that never ships an address to a crawler. No
 * `href` sits in the markup; the `mailto:` is assembled and navigated to
 * on click (and on Enter/Space, so it stays keyboard-reachable). The
 * label defaults to the [at]/[dot] rendering.
 */
export function EmailLink({
  children,
  ...rest
}: Omit<LinkArrowProps, "href">) {
  const open = () => {
    window.location.href = emailHref();
  };

  return (
    <LinkArrow
      role="link"
      tabIndex={0}
      aria-label="Send an email"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      {...rest}
    >
      {children ?? emailDisplay}
    </LinkArrow>
  );
}
