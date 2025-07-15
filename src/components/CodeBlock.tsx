import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

interface ICodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<ICodeBlockProps> = ({ code }) => {
  return (
    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
      {`\`\`\`\n${code}\n\`\`\``}
    </ReactMarkdown>
  );
};

export default CodeBlock;