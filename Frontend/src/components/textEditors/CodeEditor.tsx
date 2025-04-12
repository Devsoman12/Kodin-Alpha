import React, { useEffect, useRef, useState, useCallback } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import styles from './CodeEditor.module.css';
import MaximazeImage from '../../assets/maximaze.svg';

interface CodeEditorProps {
    value: string;
    onChange: (newValue: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [currentLine, setCurrentLine] = useState<number | null>(null);

    useEffect(() => {
        const updateCurrentLine = () => {
            if (textareaRef.current) {
                const textarea = textareaRef.current;
                const { selectionStart } = textarea;
                const lines = value.slice(0, selectionStart).split('\n');
                setCurrentLine(lines.length - 1);

                // Auto-scroll to keep the current line visible
                if (highlightRef.current) {
                    highlightRef.current.scrollTop = textarea.scrollTop;
                    highlightRef.current.scrollLeft = textarea.scrollLeft;
                }
                if (lineNumbersRef.current) {
                    lineNumbersRef.current.scrollTop = textarea.scrollTop;
                }
            }
        };

        const syncScroll = () => {
            if (!textareaRef.current || !highlightRef.current || !lineNumbersRef.current) return;
            const { scrollTop, scrollLeft } = textareaRef.current;
            highlightRef.current.scrollTop = scrollTop;
            highlightRef.current.scrollLeft = scrollLeft;
            lineNumbersRef.current.scrollTop = scrollTop;
        };

        const adjustWidth = () => {
            if (!containerRef.current) return;
            containerRef.current.style.width = '100%';
            containerRef.current.style.height = '100%';
        };

        adjustWidth();
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('keyup', updateCurrentLine);
            textarea.addEventListener('click', updateCurrentLine);
            textarea.addEventListener('keydown', updateCurrentLine);
            textarea.addEventListener('scroll', syncScroll);
        }

        return () => {
            if (textarea) {
                textarea.removeEventListener('keyup', updateCurrentLine);
                textarea.removeEventListener('click', updateCurrentLine);
                textarea.removeEventListener('keydown', updateCurrentLine);
                textarea.removeEventListener('scroll', syncScroll);
            }
        };
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
    };

    const cursorRef = useRef<number | null>(null);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = event.currentTarget;
        const { selectionStart, selectionEnd } = textarea;

        if (event.key === 'Enter') {
            event.preventDefault();
            const beforeCursor = value.slice(0, selectionStart);
            const afterCursor = value.slice(selectionEnd);

            const previousLineMatch = beforeCursor.match(/(^|\n)(\s*)/);
            const indentation = previousLineMatch ? previousLineMatch[1] : '';

            const newValue = `${beforeCursor}\n${indentation}${afterCursor}`;
            const newCursorPosition = selectionStart + 1 + indentation.length;

            onChange(newValue);

            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = newCursorPosition;
                    textareaRef.current.selectionEnd = newCursorPosition;
                }
            });

        } else if (event.key === 'Tab') {
            event.preventDefault();
            const lines = value.split('\n');
            const cursorLineIndex = value.slice(0, selectionStart).split('\n').length - 1;
            const currentLine = lines[cursorLineIndex];
            const cursorPositionInLine = selectionStart - value.slice(0, selectionStart).lastIndexOf('\n') - 1;

            if (!event.shiftKey) {
                // Insert tab space
                const beforeCursor = currentLine.slice(0, cursorPositionInLine);
                const afterCursor = currentLine.slice(cursorPositionInLine);
                lines[cursorLineIndex] = beforeCursor + '\t' + afterCursor;
                const newValue = lines.join('\n');
                onChange(newValue);

                requestAnimationFrame(() => {
                    if (textareaRef.current) {
                        textareaRef.current.selectionStart = selectionStart + 1;
                        textareaRef.current.selectionEnd = selectionStart + 1;
                    }
                });

            } else {
                // Remove tab (Shift + Tab)
                const beforeCursor = currentLine.slice(0, cursorPositionInLine);
                const afterCursor = currentLine.slice(cursorPositionInLine);
                let newCursorPos = selectionStart;

                if (beforeCursor.endsWith('\t')) {
                    lines[cursorLineIndex] = beforeCursor.slice(0, -1) + afterCursor;
                    newCursorPos = selectionStart - 1;
                } else if (beforeCursor.endsWith('    ')) {
                    lines[cursorLineIndex] = beforeCursor.slice(0, -4) + afterCursor;
                    newCursorPos = selectionStart - 4;
                }

                const newValue = lines.join('\n');
                onChange(newValue);

                requestAnimationFrame(() => {
                    if (textareaRef.current) {
                        textareaRef.current.selectionStart = Math.max(0, newCursorPos);
                        textareaRef.current.selectionEnd = Math.max(0, newCursorPos);
                    }
                });
            }
        }
    };

    const getLineNumbers = () => {
        return value.split('\n').map((_, index) => index + 1).join('\n');
    };

    const getHighlightedCode = () => {
        return value.split('\n').map((line, index) => {
            const highlightedLine = Prism.highlight(line || ' ', Prism.languages.python, 'python');
            return (
                <div
                    key={index}
                    className={`${styles.line} ${index === currentLine ? styles.currentLine : ''}`}
                    dangerouslySetInnerHTML={{ __html: highlightedLine }}
                />
            );
        });
    };

    return (
        <div ref={containerRef} className={styles.editorWrapper}>
            <div className={styles.editorHeader}>
                <span className={styles.title}>Code Editor</span>
            </div>
            <div className={styles.editorBody}>
                {/* Line Numbers */}
                <div ref={lineNumbersRef} className={styles.lineNumbers}>
                    {getLineNumbers()}
                </div>

                {/* Code Area (Highlights + Textarea) */}
                <div className={styles.editorContent}>
                    <div ref={highlightRef} className={styles.codeHighlight}>
                        {getHighlightedCode()}
                    </div>
                    <textarea
                        ref={textareaRef}
                        className={styles.codeEditor}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown} // Capture tab key press
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>
    );

};

export default CodeEditor;
