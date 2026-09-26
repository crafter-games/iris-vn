// Efectos de pantalla estilo Umineko: sacudida, destello y cristal roto.
export class Effects {
  private scene: HTMLElement;
  private flashEl: HTMLElement;
  private canvas: HTMLCanvasElement;

  constructor(scene: HTMLElement, flashEl: HTMLElement, canvas: HTMLCanvasElement) {
    this.scene = scene;
    this.flashEl = flashEl;
    this.canvas = canvas;
  }

  // amplitude en píxeles de la resolución base 1080p (tune).
  shake(amplitude = 8, duration = 250) {
    const px = (amplitude / 1080) * this.scene.clientHeight;
    const frames: Keyframe[] = [];
    const steps = Math.max(4, Math.round(duration / 30));
    for (let i = 0; i < steps; i++) {
      const decay = 1 - i / steps;
      const x = (Math.random() * 2 - 1) * px * decay;
      const y = (Math.random() * 2 - 1) * px * decay;
      frames.push({ transform: `translate(${x}px, ${y}px)` });
    }
    frames.push({ transform: "translate(0, 0)" });
    this.scene.animate(frames, { duration, easing: "linear" });
  }

  flash(color = "white", duration = 80) {
    const colors: Record<string, string> = { white: "#fff", red: "#d7263d", black: "#000", cyan: "#5ce1e6" };
    this.flashEl.style.background = colors[color] ?? color;
    this.flashEl.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: duration + 220, easing: "ease-out" });
  }

  // Glitch breve: la escena tiembla de lado y unas franjas cambian de color, como una señal que se corta.
  glitch(duration = 280) {
    const { scene } = this;
    const frames: Keyframe[] = [];
    for (let i = 0; i < 6; i++) {
      const x = (Math.random() - 0.5) * 3;
      frames.push({ transform: `translateX(${x}%) skewX(${(Math.random() - 0.5) * 4}deg)`, filter: `hue-rotate(${Math.random() * 90}deg)` });
    }
    frames.push({ transform: "none", filter: "none" });
    scene.animate(frames, { duration, easing: "steps(6)" });

    for (let i = 0; i < 4; i++) {
      const bar = document.createElement("div");
      bar.className = "glitch-bar";
      bar.style.top = `${Math.random() * 90}%`;
      bar.style.height = `${2 + Math.random() * 8}%`;
      scene.append(bar);
      bar
        .animate(
          [
            { transform: `translateX(${(Math.random() - 0.5) * 8}%)`, opacity: 1 },
            { transform: `translateX(${(Math.random() - 0.5) * 8}%)`, opacity: 1 },
            { opacity: 0 },
          ],
          { duration, easing: "steps(3)" },
        )
        .finished.then(() => bar.remove());
    }
  }

  // Grietas radiales dibujadas en canvas; aparecen de golpe y se desvanecen.
  glass(duration = 400) {
    const { canvas } = this;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = canvas.clientWidth * dpr);
    const h = (canvas.height = canvas.clientHeight * dpr);
    const g = canvas.getContext("2d")!;
    g.clearRect(0, 0, w, h);

    const cx = w * (0.35 + Math.random() * 0.3);
    const cy = h * (0.3 + Math.random() * 0.3);
    const reach = Math.hypot(w, h);
    const rays = 16 + Math.floor(Math.random() * 6);
    const rings: [number, number][][] = [[], []];

    g.lineCap = "round";
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.shadowColor = "rgba(92,225,230,0.8)";
    g.shadowBlur = 6 * dpr;

    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + Math.random() * 0.25;
      let x = cx;
      let y = cy;
      let dist = 0;
      g.lineWidth = (0.8 + Math.random() * 1.6) * dpr;
      g.globalAlpha = 0.6 + Math.random() * 0.4;
      g.beginPath();
      g.moveTo(x, y);
      while (dist < reach) {
        const step = (20 + Math.random() * 70) * dpr;
        const a = angle + (Math.random() - 0.5) * 0.35;
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
        dist += step;
        g.lineTo(x, y);
        rings.forEach((ring, r) => {
          const radius = (60 + r * 120 + Math.random() * 40) * dpr;
          if (Math.abs(dist - radius) < step / 2) ring.push([x, y]);
        });
      }
      g.stroke();
    }

    // Anillos incompletos: solo algunos tramos entre grietas vecinas, para que no parezca telaraña.
    for (const ring of rings) {
      ring.forEach(([x, y], i) => {
        if (Math.random() < 0.45) return;
        const [nx, ny] = ring[(i + 1) % ring.length];
        g.lineWidth = (0.6 + Math.random()) * dpr;
        g.globalAlpha = 0.5 + Math.random() * 0.5;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo((x + nx) / 2 + (Math.random() - 0.5) * 20 * dpr, (y + ny) / 2 + (Math.random() - 0.5) * 20 * dpr);
        g.lineTo(nx, ny);
        g.stroke();
      });
    }
    g.globalAlpha = 1;

    canvas.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 1, transform: "scale(1.01)", offset: 0.35 },
        { opacity: 0, transform: "scale(1.05) translateY(2%)" },
      ],
      { duration: duration + 300, easing: "ease-in", fill: "forwards" },
    );
  }
}
