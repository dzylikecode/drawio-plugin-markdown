import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import prism from "./prism/prism";
import "prismjs/themes/prism.css";
// import katex from "katex";
// import "katex/dist/katex.min.css";
//https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css
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

const katexExtension = {
  name: "math",
  level: "inline",
  start(src) {
    let index = src.match(/\$/)?.index;
    return index;
  },
  tokenizer(src, tokens) {
    const blockRule = /^\$\$((\\.|[^\$\\])+)\$\$/;
    const inlineRule = /^\$((\\.|[^\$\\])+)\$/;
    let match;
    if ((match = blockRule.exec(src))) {
      return {
        type: "math",
        raw: match[0],
        text: match[1].trim(),
        mathLevel: "block",
      };
    } else if ((match = inlineRule.exec(src))) {
      return {
        type: "math",
        raw: match[0],
        text: match[1].trim(),
        mathLevel: "inline",
      };
    }
  },
  renderer(token) {
    if (token.mathLevel === "block") {
      // return katex.renderToString(token.text, {
      //   throwOnError: false,
      //   displayMode: true,
      // });
      return MathJax.tex2svg(token.text, { display: true }).outerHTML;
      // return MathJax.tex2mml(token.text, { display: true }).outerHTML;
    } else if (token.mathLevel === "inline") {
      // return katex.renderToString(token.text, {
      //   throwOnError: false,
      //   displayMode: false,
      // });
      return MathJax.tex2svg(token.text, { display: false }).outerHTML;
      // return MathJax.tex2mml(token.text, { display: false }).outerHTML;
    }
  },
};

marked.use({
  extensions: [katexExtension],
});

export default function ParseMarkdown(text) {
  return marked.parse(text).replace(/>\n</g, "><");
}
