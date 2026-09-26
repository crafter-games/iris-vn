import "./style.css";
import storyJson from "../story/main.ink";
import { Script } from "./engine/script";
import { Choices } from "./ui/choices";
import { TextBox } from "./ui/textbox";

const stage = document.querySelector<HTMLElement>("#stage")!;
const title = document.querySelector<HTMLElement>("#title")!;
const textbox = new TextBox(document.querySelector("#textbox")!);
const choices = new Choices(document.querySelector("#choices")!);

function advance() {
  if (!choices.active) textbox.advance();
}

stage.addEventListener("click", advance);
window.addEventListener("keydown", (event) => {
  if (event.repeat && event.key !== "Control") return;
  if (choices.active) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") choices.move(1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") choices.move(-1);
    else if (event.key === "Enter" || event.key === " ") choices.confirm();
    else return;
  } else if (event.key === "Enter" || event.key === " ") {
    advance();
  } else return;
  event.preventDefault();
});

async function run() {
  const script = new Script(storyJson);
  for (;;) {
    const step = script.next();
    if (step.kind === "line") {
      await textbox.say(step.speaker, step.text);
    } else if (step.kind === "choices") {
      script.choose(await choices.pick(step.options));
    } else {
      textbox.hide();
      title.hidden = false;
      return;
    }
  }
}

title.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
    title.hidden = true;
    run();
  },
);
