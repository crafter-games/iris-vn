// Iconos de Phosphor (MIT), peso "light", incrustados como SVG en el bundle.
import book from "@phosphor-icons/core/light/book-open-text-light.svg?raw";
import caretDown from "@phosphor-icons/core/light/caret-down-light.svg?raw";
import clock from "@phosphor-icons/core/light/clock-counter-clockwise-light.svg?raw";
import rotate from "@phosphor-icons/core/light/device-rotate-light.svg?raw";
import forward from "@phosphor-icons/core/light/fast-forward-light.svg?raw";
import github from "@phosphor-icons/core/light/github-logo-light.svg?raw";
import floppy from "@phosphor-icons/core/light/floppy-disk-light.svg?raw";
import list from "@phosphor-icons/core/light/list-light.svg?raw";
import music from "@phosphor-icons/core/light/music-notes-light.svg?raw";
import notebook from "@phosphor-icons/core/light/notebook-light.svg?raw";
import send from "@phosphor-icons/core/light/paper-plane-right-light.svg?raw";
import play from "@phosphor-icons/core/light/play-light.svg?raw";
import prohibit from "@phosphor-icons/core/light/prohibit-light.svg?raw";
import question from "@phosphor-icons/core/light/question-light.svg?raw";
import trophy from "@phosphor-icons/core/light/trophy-light.svg?raw";
import userMinus from "@phosphor-icons/core/light/user-circle-minus-light.svg?raw";
import users from "@phosphor-icons/core/light/users-three-light.svg?raw";
import close from "@phosphor-icons/core/light/x-light.svg?raw";

const ICONS = {
  book,
  "caret-down": caretDown,
  clock,
  rotate,
  forward,
  floppy,
  github,
  list,
  music,
  notebook,
  send,
  play,
  prohibit,
  question,
  trophy,
  "user-minus": userMinus,
  users,
  close,
};

export type IconName = keyof typeof ICONS;

export function icon(name: IconName) {
  const span = document.createElement("span");
  span.className = `icon icon--${name}`;
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = ICONS[name];
  return span;
}

// Reemplaza los <… data-icon="nombre"> del HTML estático: el icono va antes del texto.
export function hydrateIcons(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-icon]").forEach((el) => {
    const name = el.dataset.icon as IconName;
    if (ICONS[name] && !el.querySelector(":scope > .icon")) el.prepend(icon(name));
  });
}
