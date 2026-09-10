/* Address handling, kept away from scrapers.
 *
 * Harvesters pull `mailto:` hrefs out of markup and regex `user@host`
 * out of text. So the address never exists as a literal anywhere in the
 * bundle or the DOM: the parts are assembled at runtime, the page shows
 * the [at]/[dot] convention, and the `mailto:` is built only when
 * someone actually clicks. */

const USER = ["anthony", "ros", "garcia"].join("");
const HOST = ["gmail", "com"];

/** What the page displays: anthonyrosgarcia [at] gmail [dot] com */
export const emailDisplay = `${USER} [at] ${HOST.join(" [dot] ")}`;

/** The real address, assembled on demand. */
export function emailAddress(): string {
  return `${USER}@${HOST.join(".")}`;
}

/** A `mailto:` URL, assembled on demand. */
export function emailHref(): string {
  return `${"mail" + "to"}:${emailAddress()}`;
}
