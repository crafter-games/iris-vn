export type Segment = { text: string; red: boolean };

// "[[r]]…[[/r]]" marca una verdad roja dentro de una línea.
export function parseMarkup(line: string): Segment[] {
  const segments: Segment[] = [];
  const re = /\[\[r\]\]([\s\S]*?)\[\[\/r\]\]/g;
  let last = 0;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    if (m.index > last) segments.push({ text: line.slice(last, m.index), red: false });
    segments.push({ text: m[1], red: true });
    last = m.index + m[0].length;
  }
  if (last < line.length) segments.push({ text: line.slice(last), red: false });
  return segments;
}

export function plainLength(segments: Segment[]) {
  return segments.reduce((n, s) => n + s.text.length, 0);
}

export function hasRed(segments: Segment[]) {
  return segments.some((s) => s.red);
}

// Pinta los primeros `count` caracteres de los segmentos dentro de `el`.
export function renderSegments(el: HTMLElement, segments: Segment[], count = Infinity) {
  el.replaceChildren();
  let left = count;
  for (const segment of segments) {
    if (left <= 0) break;
    const text = segment.text.slice(0, left);
    left -= text.length;
    if (segment.red) {
      const span = document.createElement("span");
      span.className = "red-truth";
      span.textContent = text;
      el.append(span);
    } else {
      el.append(text);
    }
  }
}
