import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import generateUniqueId from "generate-unique-id";

export function show_toast(message: string, type: "success" | "error") {
  const toastFunction = type === "success" ? toast.success : toast.error;
  toastFunction(message, {
    position: "top-right",
    style: {
      background: "#f5cd40",
      color: "#000000",
      minWidth: "200px",
    },
  });
}

export function redirect_and_toast(destination: string, message: string) {
  show_toast(message, "error");
  // Note: Use this with useNavigate hook in components
  window.location.href = destination;
}

export async function sleep(ms?: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function measure_scrollbar() {
  if (typeof window === "undefined") return;
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.overflow = "scroll";
  div.style.position = "absolute";
  div.style.top = "-9999px";
  document.body.appendChild(div);
  const scrollbarWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);
  return scrollbarWidth;
}

export const scrollbar_width = measure_scrollbar();

export function format(number: number, places = 2) {
  return +number?.toFixed(places);
}

export function get_remaining_height(el: HTMLElement, margin = 0) {
  if (!el) return 0;
  const { top } = el.getBoundingClientRect();
  const { innerHeight } = window;
  return innerHeight - top - margin;
}

export function generate_id() {
  return generateUniqueId() as string;
}

export function find_all_indicies(str: string, substr: string) {
  const occurrences: number[] = [];
  let pos = str.indexOf(substr);
  while (pos !== -1) {
    occurrences.push(pos);
    pos = str.indexOf(substr, pos + 1);
  }
  return occurrences;
}
