import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

// Detailed content for AdSense "Publisher Content" requirements
const BLOG_CONTENT = {
    'coding-interview-prep-guide': {
        title: 'The Ultimate Guide to Coding Interview Preparation',
        date: 'Jan 24, 2026',
        readTime: '10 min read',
        content: `
            <p>Landing a job at a top-tier tech company like Google, Meta, or Amazon is a multi-step process that requires disciplined preparation. While technical skills are paramount, the approach you take to study can make the difference between a rejection and a six-figure offer.</p>
            
            <h3>1. The Fundamentals First</h3>
            <p>Before jumping into LeetCode "Hard" problems, you must have a rock-solid understanding of Data Structures and Algorithms (DSA). You should be able to implement these from scratch without looking at a reference:</p>
            <ul>
                <li>Arrays and String Manipulation</li>
                <li>Linked Lists (Singly, Doubly, Circular)</li>
                <li>Stacks and Queues</li>
                <li>Trees (Binary, BST, AVL)</li>
                <li>Graphs (Adjacency Matrix and List)</li>
                <li>Heaps / Priority Queues</li>
                <li>Hash Tables</li>
            </ul>

            <h3>2. Mastering Time and Space Complexity</h3>
            <p>Big O notation is the language of interviews. You don't just need to find <i>a</i> solution; you need to find the <i>most efficient</i> solution. Practice calculating the complexity of every algorithm you write. Understand why a Hash Map lookup is O(1) on average but can be O(n) in the worst case.</p>

            <h3>3. The 14 Essential Patterns</h3>
            <p>Most coding interview questions are variations of a few core patterns. Instead of solving 500 random problems, focus on mastering these:</p>
            <ul>
                <li>Two Pointers</li>
                <li>Sliding Window</li>
                <li>Fast & Slow Pointers</li>
                <li>Merge Intervals</li>
                <li>Cyclic Sort</li>
                <li>In-place Reversal of a Linked List</li>
                <li>Tree Breadth First Search</li>
                <li>Tree Depth First Search</li>
                <li>Two Heaps</li>
                <li>Subsets (Backtracking)</li>
                <li>Modified Binary Search</li>
                <li>Top 'K' Elements</li>
                <li>K-way Merge</li>
                <li>Topological Sort</li>
            </ul>

            <h3>4. Mock Interviews are Key</h3>
            <p>Coding in your IDE is different from coding on a whiteboard or a shared document while explaining your thought process. Use platforms like Pramp or practice with a friend. The ability to communicate your logic clearly is often as important as the code itself.</p>

            <h3>5. Leveraging Tools like LeetVision</h3>
            <p>Sometimes, reading a text-based solution is not enough. Visualizing how a pointer moves through an array or how a recursion tree grows can provide that "aha!" moment. This is where LeetVision comes in, curated video explanations that show you the "why" behind the code.</p>
        `
    },
    'leetcode-patterns-vs-memorization': {
        title: 'LeetCode Patterns vs. Memorization: Why Patterns Win',
        date: 'Jan 23, 2026',
        readTime: '8 min read',
        content: `
            <p>One of the biggest mistakes candidates make is trying to memorize hundreds of LeetCode solutions. With over 3,000 problems on the platform and new ones added weekly, memorization is a losing game. The key is <strong>Pattern Recognition</strong>.</p>

            <h3>Why Memorization Fails</h3>
            <p>Memorization works for simple exams, but technical interviews are designed to test problem-solving. An interviewer will often give you a slight variation of a known problem. If you memorized the "optimal solution" for the original, but don't understand the underlying pattern, you will struggle to adapt to the change.</p>

            <h3>The Power of Patterns</h3>
            <p>Consider the "Sliding Window" pattern. Once you understand how to maintain a window of elements to find a subarray that meets certain criteria, you can solve dozens of problems:</p>
            <ul>
                <li>Maximum Sum Subarray of Size K</li>
                <li>Smallest Subarray with a Given Sum</li>
                <li>Longest Substring with K Distinct Characters</li>
                <li>Fruits into Baskets</li>
            </ul>
            <p>By learning one pattern, you effectively "memorize" the logic for fifty different problems.</p>

            <h3>How to Shift Your Mindset</h3>
            <p>When you solve a problem, don't just move on to the next. Ask yourself: "What made this problem solvable? What was the hint?" If you used a Hash Map to store indices, that's a hint for the Hash Table pattern. If you sorted the array first, you utilized the Sorting pattern. Start classifying problems yourself.</p>
        `
    },
    'how-to-use-leetvision-effectively': {
        title: 'How to Use LeetVision to Accelerate Your Learning',
        date: 'Jan 22, 2026',
        readTime: '6 min read',
        content: `
            <p>LeetVision was built to solve a specific problem: the friction between encountering a difficult problem and finding a high-quality explanation. Here is how to use it for maximum efficiency.</p>

            <h3>1. The "15 Minute Rule"</h3>
            <p>When you hit a new problem, try to solve it on your own for 15-20 minutes. Struggle with it. If you are completely stuck after that, don't waste hours. Use LeetVision to find a video explanation.</p>

            <h3>2. Active Viewing</h3>
            <p>Don't just watch the video solution like a movie. When the creator explains the logic but before they start coding, <strong>pause the video</strong>. Go back to LeetCode and try to implement what they just explained. This active recall fixes the logic in your long-term memory.</p>

            <h3>3. Use the Extension</h3>
            <p>The LeetVision browser extension is your best friend. It embeds the video directly on the LeetCode page. This keeps you in the "flow state" and prevents the distractions that come with opening YouTube in a separate tab.</p>

            <h3>4. Follow the Roadmaps</h3>
            <p>Don't solve problems randomly. Use the curated lists like "Blind 75" or "Top 100 Liked" questions available on our platform. These have been vetted by thousands of successful candidates as the most representative questions for modern interviews.</p>
        `
    }
};

const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            setLoading(true);
            if (BLOG_CONTENT[id]) {
                setPost(BLOG_CONTENT[id]);
                setLoading(false);
            } else {
                try {
                    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const res = await axios.get(`${API_BASE}/api/articles/${id}`);
                    if (res.data) {
                        setPost({
                            title: res.data.title,
                            date: new Date(res.data.publishedDate).toLocaleDateString(),
                            readTime: '8 min read',
                            content: res.data.content,
                            isDynamic: true
                        });
                    }
                } catch (err) {
                    console.error('Error fetching dynamic post:', err);
                }
                setLoading(false);
            }
        };
        loadPost();
    }, [id]);

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '300px', maxWidth: '800px', margin: '0 auto' }}></div>
        </div>;
    }

    if (!post) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h1>Post Not Found</h1>
            <Link to="/blog">Back to Blog</Link>
        </div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: '#ddd', lineHeight: '1.8' }}>
            <SEO title={post.title} description={post.title} path={`/blog/${id}`} />

            <Link to={post.isDynamic ? "/daily-tech" : "/blog"} style={{ color: '#888', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
                ← Back to {post.isDynamic ? "Daily Tech" : "Guides"}
            </Link>

            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>{post.title}</h1>
                <div style={{ color: '#888', display: 'flex', gap: '1rem' }}>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                </div>
            </header>

            <div
                className="blog-content"
                style={{ fontSize: '1.1rem' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <style>{`
                .blog-content h3 { color: #fff; margin-top: 2.5rem; margin-bottom: 1rem; }
                .blog-content p { margin-bottom: 1.5rem; }
                .blog-content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .blog-content li { margin-bottom: 0.5rem; }
                .blog-content strong { color: #fff; }
                .blog-content i { color: #f57c00; }
            `}</style>

            <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid #333', textAlign: 'center' }}>
                <h3 style={{ color: '#fff' }}>Continue Your Preparation</h3>
                <p>Ready to put these patterns into practice?</p>
                <Link to="/top-100-leetcode" style={{ display: 'inline-block', background: '#f57c00', color: '#fff', padding: '0.8rem 2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: 600, marginTop: '1rem' }}>
                    Solve Top 100 Questions
                </Link>
            </div>

            <AdSenseContainer slot="8240394871" />
        </div>
    );
};

export default BlogPost;
