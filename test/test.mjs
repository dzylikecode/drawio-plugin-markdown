import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import prism from "prismjs";
const marked = new Marked(
  markedHighlight({
    // langPrefix: "hljs language-",
    highlight(code, lang) {
      if (prism.languages[lang]) {
        return prism.highlight(code, prism.languages[lang], lang);
      } else {
        return code;
      }
    },
  })
);
const testString =
  "- hello\n- world\n```js\nconst a = 1;\nconst b = 2\n```\n`<embed/>`";
// marked.use({
//   highlight: (code, lang) => {
//     if (prism.languages[lang]) {
//       return prism.highlight(code, prism.languages[lang], lang);
//     } else {
//       return code;
//     }
//   },
// });
const res = marked.parse(testString);
console.log(res);
