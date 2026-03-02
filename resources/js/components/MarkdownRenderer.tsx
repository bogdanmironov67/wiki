import hljs from 'highlight.js';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useState } from 'react';
import markedFootnote from 'marked-footnote';
import { gfmHeadingId } from 'marked-gfm-heading-id';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
  gfmHeadingId(),
  markedFootnote()
);

marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const parseContent = async () => {
      const html = await marked.parse(content);
      setHtmlContent(html);
    };

    parseContent();
  }, [content]);

  return (
    <div
      className={`prose max-w-none prose-slate dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
