import React, { useState } from 'react';
import styles from './Forum.module.css';
import CommentOverlay from '../overlay/CommentOverlay';

interface Post {
    id: number;
    content: string;
    author: string;
    commentCount: number;
}

interface NewsItem {
    id: number;
    content: string;
    date: string;
}

const Forum: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([
        { id: 1, content: "This is a sample trending post!", author: "User1", commentCount: 5 },
        { id: 2, content: "Another interesting discussion.", author: "User2", commentCount: 8 }
    ]);

    const [news, setNews] = useState<NewsItem[]>([
        { id: 1, content: "Site update: New features coming soon!", date: "Feb 18, 2025" },
        { id: 2, content: "Reminder: Follow community guidelines!", date: "Feb 15, 2025" }
    ]);

    const [newPostContent, setNewPostContent] = useState('');
    const [showCommentOverlay, setShowCommentOverlay] = useState<number | null>(null);

    const handleAddPost = () => {
        if (!newPostContent.trim()) return;

        const newPost = {
            id: posts.length + 1,
            content: newPostContent,
            author: "You",
            commentCount: 0
        };

        setPosts([newPost, ...posts]);
        setNewPostContent('');
    };

    return (
        <div className={styles.forumContainer}>
            <div className={styles.column}>
                <h3 className={styles.sectionTitle}>Add a Post</h3>
                <textarea
                    className={styles.postInput}
                    placeholder="Write something..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                />
                <button className={styles.addPostButton} onClick={handleAddPost}>
                    Post
                </button>
            </div>

            <div className={styles.column}>
                <h3 className={styles.sectionTitle}>Trending Posts</h3>
                <div className={styles.postList}>
                    {posts.length === 0 ? (
                        <p className={styles.noPosts}>No posts yet. Be the first to add one!</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className={styles.postItem}>
                                <p className={styles.postContent}>{post.content}</p>
                                <div className={styles.postFooter}>
                                    <span className={styles.commentCount}>
                                        💬 {post.commentCount} Comments
                                    </span>
                                    <button
                                        className={styles.commentButton}
                                        onClick={() => setShowCommentOverlay(post.id)}
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={styles.column}>
                <h3 className={styles.sectionTitle}>News</h3>
                <div className={styles.newsList}>
                    {news.length === 0 ? (
                        <p className={styles.noNews}>No news available.</p>
                    ) : (
                        news.map((item) => (
                            <div key={item.id} className={styles.newsItem}>
                                <p className={styles.newsContent}>{item.content}</p>
                                <span className={styles.newsDate}>{item.date}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showCommentOverlay !== null && (
                <CommentOverlay
                    solution_id={showCommentOverlay}
                    onClose={() => setShowCommentOverlay(null)}
                />
            )}
        </div>
    );
};

export default Forum;
