// Aviso breve arriba a la derecha (pista nueva, partida guardada…).
export class Toast {
  private host: HTMLElement;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  show(message: string, ms = 2600) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    this.host.append(el);
    const anim = el.animate(
      [
        { opacity: 0, transform: "translateX(2cqw)" },
        { opacity: 1, transform: "none", offset: 0.1 },
        { opacity: 1, transform: "none", offset: 0.85 },
        { opacity: 0, transform: "translateX(1cqw)" },
      ],
      { duration: ms, easing: "ease-out" },
    );
    anim.finished.then(() => el.remove());
  }
}
