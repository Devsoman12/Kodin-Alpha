import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './TextEditor.module.css';

import boldIcon from '../../assets/bold.svg';
import italicIcon from '../../assets/italic.svg';
import underlineIcon from '../../assets/underline.svg';
import listIcon from '../../assets/Paragraph_list.svg';
import linkIcon from '../../assets/link_icon.svg';
import imageIcon from '../../assets/image_icon.svg';


interface TextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const [showPreview, setShowPreview] = useState(false);

  const wrapText = (symbol: string, placeholder: string) => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const before = value.substring(0, start);
    const after = value.substring(end);
    onChange(`${before}${symbol}${selectedText}${symbol}${after}`);
  };

  const insertLink = () => {
    wrapText('[', 'link text](http://example.com)');
  };

  const toolbarActions = [
    { icon: boldIcon, action: () => wrapText('**', 'bold text'), tooltip: 'Bold' },
    { icon: italicIcon, action: () => wrapText('_', 'italic text'), tooltip: 'Italic' },
    { icon: underlineIcon, action: () => wrapText('<u>', 'underlined text'), tooltip: 'Underline' },
    { icon: listIcon, action: () => wrapText('- ', 'List item'), tooltip: 'List' },
    { icon: linkIcon, action: insertLink, tooltip: 'Insert Link' },
    { icon: imageIcon, action: () => wrapText('![', 'alt text](image-url)'), tooltip: 'Insert Image' },
  ];

  return (
      <div className={styles.textEditorContainer}>
        <div className={styles.toolbar}>
          {toolbarActions.map(({ icon, action, tooltip }, index) => (
              <button
                  key={index}
                  onClick={action}
                  className={styles.toolbarButton}
                  title={tooltip}
              >
                <img src={icon} alt={tooltip} className={styles.toolbarIcon} />
              </button>
          ))}
          <button
              onClick={() => setShowPreview(!showPreview)}
              className={styles.toolbarButton}
              title="Toggle Preview"
              aria-label="Toggle Preview"
          >
            {showPreview ? '✏️' : '👁️'}
          </button>
        </div>

        {showPreview ? (
            <div className={styles.preview}>
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
        ) : (
            <textarea
                id="markdown-textarea"
                className={styles.textarea}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Everything begins with a definition..."
            />
        )}
      </div>
  );
};

export default TextEditor;
