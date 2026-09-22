/** Scroll a field into view inside the app scroller without jumping the whole shell (iOS Safari). */
export function scrollFieldIntoView(element: HTMLElement) {
  requestAnimationFrame(() => {
    element.scrollIntoView({ block: "nearest", behavior: "auto" });
  });
}
