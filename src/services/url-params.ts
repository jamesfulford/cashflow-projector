export const urlParams = new URLSearchParams(
  window.location.href.split("?").slice(1).join("?"),
);
