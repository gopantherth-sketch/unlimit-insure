import { contact } from "@/content/contact";

const lineIdEncoded = encodeURIComponent(contact.lineId);

/** Opens the LINE app on the "add friend" screen for the official account. */
export const lineAddUrl = `https://line.me/R/ti/p/${lineIdEncoded}`;

/** Opens a chat with the official account with `text` prefilled (the customer still presses send). */
export function lineMessageUrl(text: string): string {
  return `https://line.me/R/oaMessage/${lineIdEncoded}/?${encodeURIComponent(text)}`;
}

export const telHref = `tel:${contact.phoneE164}`;
