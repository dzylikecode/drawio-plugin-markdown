const html =
  "<div>\n  <p>Hello, world!</p>\n<code>\n    const x = 1;\n    const y = 2;\n  </code>\n</div>";
const modifiedHtml = html.replace(
  /(<code>[\s\S]*?<\/code>)|>\n</g,
  (match, code) => (code ? code : "><")
);
console.log(modifiedHtml);
