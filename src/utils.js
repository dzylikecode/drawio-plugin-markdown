import ParseMarkdown from "./parseMd";

/**
 *
 * @param {string} text
 * @returns
 */
export function escapeHtml(text) {
  // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
  // Warning: it does not escape quotes so you can't use the output inside attribute values in HTML code.
  // [](https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript#:~:text=Warning:%20it%20does%20not%20escape%20quotes%20so%20you%20can't%20use%20the%20output%20inside%20attribute%20values%20in%20HTML%20code)

  // const textNode = document.createTextNode(text);
  // const div = document.createElement("div");
  // div.appendChild(textNode);
  // return div.innerHTML;

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 *
 * @param {string} text
 * @returns
 */
export function unescapeHtml(escapeHtml) {
  // const doc = new DOMParser().parseFromString(escapeHtml, "text/html");
  // return doc.documentElement.textContent;

  // https://www.educative.io/answers/how-to-escape-unescape-html-characters-in-string-in-javascript
  return escapeHtml
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 *
 * @param {string} text html string
 * @returns
 */
export function ExtractMarkdown(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  return unescapeHtml(div.firstChild.getAttribute("data-content"));
}
/**
 *
 * @param {string} text markdown string, not escape
 * @returns the string in data-content is escaped
 */
export function WrapMarkdown(text) {
  return `<div data-content="${escapeHtml(text)}">${ParseMarkdown(text)}</div>`;
}
