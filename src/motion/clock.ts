// The one clock. A single requestAnimationFrame loop that runs only while a task is registered,
// so a page at rest costs nothing. Tasks return false when they are finished.
type Task = (now: number) => boolean | void;

const tasks = new Set<Task>();
let raf = 0;

function frame(now: number) {
  for (const t of tasks) if (t(now) === false) tasks.delete(t);
  raf = tasks.size ? requestAnimationFrame(frame) : 0;
}

export function onFrame(task: Task): () => void {
  tasks.add(task);
  if (!raf) raf = requestAnimationFrame(frame);
  return () => tasks.delete(task);
}

export const reducedMotion = () => !document.documentElement.classList.contains('motion');

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
