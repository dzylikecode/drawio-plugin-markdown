import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import prism from "./prism/prism";
// import "prismjs/themes/prism.css";
import prismCssText from "raw-loader!./prism/prism.css";

// import katex from "katex";
// import "katex/dist/katex.min.css";
//https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css
const renderHighLight = {
  id: 0,
  getID() {
    return `${this.id++}`;
  },
  tasks: {},
  getOccupiedStr(id) {
    return `<highlight-${id}/>`;
  },
  pushTask(id, fn) {
    this.tasks[id] = fn;
  },
  renderString(str) {
    const regID = /<highlight-(\d+)\/>/g;
    return str.replace(regID, (match, id) => {
      return this.tasks[id]();
    });
  },
  reset() {
    this.id = 0;
    this.tasks = {};
  },
  bindCss(str) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(prismCssText);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = str;
    const renderPart = tempDiv;
    for (const rule of styleSheet.cssRules) {
      const { selectorText } = rule;
      const elems = renderPart.querySelectorAll(selectorText);
      for (const elem of elems) {
        const styleDeclaration = rule.style;
        for (const property of styleDeclaration) {
          elem.style[property] = styleDeclaration[property];
        }
      }
    }
    return tempDiv.innerHTML;
  },
};

const marked = new Marked(
  markedHighlight({
    // langPrefix: "hljs language-",
    highlight(code, lang) {
      if (prism.languages[lang]) {
        const id = renderHighLight.getID();
        renderHighLight.pushTask(id, () => {
          return prism.highlight(code, prism.languages[lang], lang);
        });
        return renderHighLight.getOccupiedStr(id);
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
  renderHighLight.reset();
  const compressHtml = marked.parse(text).replace(/>\n</g, "><");
  // don't replace \n in <code></code>
  const html = renderHighLight.renderString(compressHtml);
  return renderHighLight.bindCss(html);
}
