import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import styles from './DocsPage.module.css';
import LogoImage from '../../assets/sidebar_logo.svg';
import { useNavigate } from 'react-router-dom';

import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript.min.js';
import 'prismjs/components/prism-c.min.js';


const DocsPage: React.FC = () => {
    const [docStructure, setDocStructure] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [headings, setHeadings] = useState<any[]>([]);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // New state for sidebar expansion

    const contentRef = useRef<HTMLDivElement | null>(null); // Reference for content container

    const navigate = useNavigate();
    const handleNavigate = () => navigate('/');


    useEffect(() => {
        fetch('http://localhost:5000/api/docs/structure')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    throw new Error('Expected JSON response, but received something else');
                }
            })
            .then((data) => {
                setDocStructure(data.docStructure || []);
            })
            .catch((err) => {
                console.error('Error fetching documentation structure:', err);
                setError(err.message);
            });
    }, []);

    const handleSidebarToggle = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    useEffect(() => {
        if (selectedFile) {
            fetch(`http://localhost:5000/api${selectedFile}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.text();
                })
                .then((data) => {
                    setContent(data);
                    const newHeadings = extractHeadings(data);
                    setHeadings(newHeadings);  // Save headings for this file
                })
                .catch((err) => {
                    console.error('Error fetching markdown file:', err);
                    setError(err.message);
                });
        }
    }, [selectedFile]);

    useEffect(() => {
        // Delay syntax highlighting until content is updated
        if (content) {
            setTimeout(() => {
                Prism.highlightAll();
            }, 0);  // Call it after the DOM has updated
        }
    }, [content]);  // This triggers when content changes

    // const extractHeadings = (markdown: string) => {
    //     const regex = /^(#{1,6})\s*(.*)$/gm;
    //     const headings: any[] = [];
    //     let match;
    //     while ((match = regex.exec(markdown)) !== null) {
    //         const level = match[1].length;
    //         const title = match[2];
    //         headings.push({ level, title, id: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') });
    //     }
    //     return headings;
    // };


    const handleScrollToHeading = (e: React.MouseEvent, headingId: string) => {
        e.preventDefault();

        const element = document.getElementById(headingId);
        if (element && contentRef.current) {
            // Scroll the content area only, not the entire page
            contentRef.current.scrollTo({
                top: element.offsetTop - 100,  // Adjust the number (e.g., 50px) to move the heading higher
                behavior: 'smooth'
            });
        }
    };

    const renderTree = (structure: any[]) => {
        return structure.map((item) => {
            const children = Array.isArray(item.children) ? item.children : [];

            const fileHeadings = item.path === selectedFile ? headings : [];

            return (
                <div key={item.path} className={styles.treeItem}>
                    <div
                        className={styles.treeItemTitle}
                        onClick={() => setSelectedFile(item.path)}
                    >
                        {item.title}
                    </div>

                    {fileHeadings.length > 0 && (
                        <div>
                            {fileHeadings.map((heading) => (
                                <div
                                    key={heading.id}
                                    className={`${styles.treeChildren} ${isSidebarExpanded ? styles.expanded : styles.collapsed}`}
                                >
                                    <a
                                        href={`#${heading.id}`}
                                        className={styles.headingLink}
                                        onClick={(e) => handleScrollToHeading(e, heading.id)}
                                    >
                                        {heading.title}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                    {children.length > 0 && (
                        <div
                            className={`${styles.treeChildren} ${isSidebarExpanded ? styles.expanded : styles.collapsed}`}
                            style={{ display: isSidebarExpanded ? 'block' : 'none' }} // Hide children when collapsed
                        >
                            {renderTree(children)}
                        </div>
                    )}
                </div>
            );
        });
    };


    const extractHeadings = (markdown: string) => {
        const regex = /^(#{1,6})\s*(.*\(\$\).*)$/gm; // berie len tie s ($)
        const headings: any[] = [];
        let match;
        while ((match = regex.exec(markdown)) !== null) {
            const level = match[1].length;
            let title = match[2].replace('($)', '').trim(); // odstrániš ($)
            headings.push({
                level,
                title,
                id: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            });
        }
        return headings;
    };


    const renderMarkdown = () => {
        return (
            <ReactMarkdown
                children={content}
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => {
                        const rawText = props.children.toString();
                        const cleanText = rawText.replace('($)', '').trim();
                        const id = cleanText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                        return <h1 id={id}>{cleanText}</h1>;
                    },
                    h2: ({ node, ...props }) => {
                        const rawText = props.children.toString();
                        const cleanText = rawText.replace('($)', '').trim();
                        const id = cleanText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                        return <h2 id={id}>{cleanText}</h2>;
                    },
                    h3: ({ node, ...props }) => {
                        const rawText = props.children.toString();
                        const cleanText = rawText.replace('($)', '').trim();
                        const id = cleanText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                        return <h3 id={id}>{cleanText}</h3>;
                    },
                    code: ({ node, inline, className, children, ...props }) => {
                        const language = className?.replace('language-', '');
                        return inline ? (
                            <code {...props} className={className}>{children}</code>
                        ) : (
                            <pre className={className}>
                            <code className={`language-${language}`} {...props}>
                                {children}
                            </code>
                        </pre>
                        );
                    },
                    img: ({node, ...props}) => {
                        console.log('Image path from markdown:', props.src);

                        // Decode the URL and replace %2F with /
                        let imagePath = decodeURIComponent(props.src);
                        imagePath = imagePath.replace(/%2F/g, '/');

                        return <img {...props} src={imagePath} />;

                    },
                }}
            />
        );
    };


    return (

        <>

            <div className={styles.docsPage}>
                <div className={styles.header}>
                    <img
                        className={styles.headerSvg}
                        alt="Logo"
                        src={LogoImage}
                        onClick={handleNavigate}
                    />
                    <div>Docs</div>

                </div>

                <div className={styles.mainContainer}>
                    <div className={`${styles.sidebar} ${isSidebarExpanded ? styles.expanded : styles.collapsed}`}>
                        <button onClick={handleSidebarToggle} className={styles.sidebarToggle}>
                            {isSidebarExpanded ? 'Collapse' : 'Expand'}
                        </button>
                        {error ? (
                            <div className={styles.error}>{`Error: ${error}`}</div>
                        ) : (
                            renderTree(docStructure)
                        )}
                    </div>
                    <div className={styles.content} ref={contentRef}>
                        {selectedFile ? (
                            renderMarkdown()
                        ) : (
                            <div>Please select a file from the left to view its content</div>
                        )}
                    </div>
                </div>
            </div>

        </>
    );
};

export default DocsPage;
