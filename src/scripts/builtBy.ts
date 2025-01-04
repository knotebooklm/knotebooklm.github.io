import { contributors } from "../data/contributors";

class TextScramble {
  chars: string;
  el: HTMLElement;
  frame: number;
  frameRequest: number;
  queue: {
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }[];
  resolve: (value: unknown) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => undefined;
  }
  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += char;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve("finished");
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function shuffle(array: string[]) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const names = shuffle(
  contributors.map((fullName) => fullName.split(" ")[0].toLowerCase()),
);

const last = "the northridge dev knights";
names.push(last);

const el: HTMLElement = document.querySelector(".rollcall")!;
const fx = new TextScramble(el);

let counter = 0;
export const next = () => {
  if (counter < names.length) {
    fx.setText(names[counter]).then(() => {
      setTimeout(next, 500);
    });
  }
  counter = counter + 1;
};
