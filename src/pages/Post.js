import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { postsAPI, likesAPI, commentsAPI, storageAPI } from '../service/api';

function Post() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { getUserDisplayName } = useUser();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLikes, setUserLikes] = useState(new Set());
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(true);
    const [loadingComments, setLoadingComments] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    const getUserInitial = () => {
        const name = getUserDisplayName();
        return name.charAt(0).toUpperCase();
    };

    const getAuthorInitial = (authorName) => {
        return authorName.charAt(0).toUpperCase();
    };

    // Format date to relative time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Agora';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
        
        return date.toLocaleDateString('pt-BR');
    };

    // Load image URL
    const loadImageUrl = async (imageIdBucket) => {
        if (!imageIdBucket) return;
        
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const { createSupabaseClient, SUPABASE_CONFIG, getDirectImageUrl } = await import('../config/supabase');
                const supabase = createSupabaseClient(token);

                const { data, error } = await supabase.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .createSignedUrl(imageIdBucket, 3600);

                if (error) {
                    console.error('Error creating signed URL:', error);
                    const directUrl = getDirectImageUrl(imageIdBucket);
                    setImageUrl(directUrl);
                } else {
                    setImageUrl(data.signedUrl);
                }
            } else {
                const { getDirectImageUrl } = await import('../config/supabase');
                const directUrl = getDirectImageUrl(imageIdBucket);
                setImageUrl(directUrl);
            }
        } catch (err) {
            console.error('Error loading image URL:', err);
            const { getDirectImageUrl } = await import('../config/supabase');
            const directUrl = getDirectImageUrl(imageIdBucket);
            setImageUrl(directUrl);
        }
    };

    // Fetch post data
    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await postsAPI.getPost(postId);
            
            if (response.success) {
                const postData = {
                    ...response.data,
                    author: response.data.usersData?.displayName || 'Usuário',
                    time: formatTime(response.data.created_at),
                    content: response.data.description
                };
                setPost(postData);
                
                // Load image if exists
                if (postData.image_id_bucket) {
                    loadImageUrl(postData.image_id_bucket);
                }
                
                // Check if user liked this post
                if (authUser) {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        const likeResponse = await likesAPI.checkUserLiked(postId, token);
                        if (likeResponse.success && likeResponse.data.liked) {
                            setUserLikes(new Set([postId]));
                        }
                    }
                }
            } else {
                setError('Post não encontrado');
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Erro ao carregar post');
        } finally {
            setLoading(false);
        }
    };

    // Fetch comments
    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const response = await commentsAPI.getPostComments(postId, 50, 0);
            if (response.success) {
                const formattedComments = response.data.map(comment => ({
                    ...comment,
                    author: comment.usersData?.displayName || 'Usuário',
                    time: formatTime(comment.created_at),
                    content: comment.comment_content
                }));
                setComments(formattedComments);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    // Handle like toggle
    const handleLike = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const response = await likesAPI.toggleLike(postId, token);
            
            if (response.success) {
                setPost(prev => ({
                    ...prev,
                    likes: response.data.liked ? prev.likes + 1 : prev.likes - 1
                }));

                setUserLikes(prev => {
                    const newLikes = new Set(prev);
                    if (response.data.liked) {
                        newLikes.add(postId);
                    } else {
                        newLikes.delete(postId);
                    }
                    return newLikes;
                });
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const response = await commentsAPI.createComment(postId, newComment.trim(), token);
            if (response.success) {
                setNewComment('');
                fetchComments();
                setPost(prev => ({ ...prev, comments: prev.comments + 1 }));
            }
        } catch (err) {
            console.error('Error creating comment:', err);
        }
    };

    // Copy share link
    const copyShareLink = async () => {
        const shareUrl = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copiado para a área de transferência!');
        } catch (err) {
            console.error('Error copying link:', err);
            alert('Erro ao copiar link');
        }
    };

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [postId]);

    if (loading) {
        return (
            <div className="post-page">
                <div className="loading-message">
                    <div className="loading-spinner">⏳</div>
                    <p>Carregando post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="post-page">
                <div className="error-message">
                    <div className="error-icon">❌</div>
                    <p>{error || 'Post não encontrado'}</p>
                    <button onClick={() => navigate('/')} className="retry-btn">
                        Voltar ao Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="post-page">
            <div className="post-container">
                <div className="post-header">
                    <button onClick={() => navigate('/')} className="back-btn">
                        ← Voltar
                    </button>
                    <h1>Post</h1>
                </div>

                <article className="post-card">
                    <div className="post-header">
                        <div className="post-avatar">
                            {getAuthorInitial(post.author)}
                        </div>
                        <div className="post-info">
                            <div className="post-author">{post.author}</div>
                            <div className="post-time">{post.time}</div>
                        </div>
                    </div>
                    
                    <div className="post-content">
                        {post.content}
                    </div>
                    
                    {imageUrl && (
                        <div className="post-image">
                            <img 
                                src={imageUrl}
                                alt="Post image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    
                    <div className="post-actions">
                        <button 
                            className={`action-btn ${userLikes.has(post.id) ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            <div className="action-icon">
                                {userLikes.has(post.id) ? '❤️' : '🤍'}
                            </div>
                            <span>{post.likes}</span>
                        </button>
                        <button 
                            className="action-btn"
                            onClick={() => setShowComments(!showComments)}
                        >
                            <div className="action-icon">💬</div>
                            <span>{post.comments}</span>
                        </button>
                        <button 
                            className="action-btn"
                            onClick={copyShareLink}
                        >
                            <div className="action-icon">🔗</div>
                            <span>Compartilhar</span>
                        </button>
                    </div>
                    
                    {/* Comments Section */}
                    {showComments && (
                        <div className="comments-section">
                            <div className="comments-list">
                                {loadingComments ? (
                                    <div className="loading-comments">
                                        <div className="loading-spinner">⏳</div>
                                        <span>Carregando comentários...</span>
                                    </div>
                                ) : comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-avatar">
                                                {getAuthorInitial(comment.author)}
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.author}</span>
                                                    <span className="comment-time">{comment.time}</span>
                                                </div>
                                                <div className="comment-text">{comment.content}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-comments">
                                        <span>Nenhum comentário ainda. Seja o primeiro!</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Comment Input */}
                            <form 
                                className="comment-form"
                                onSubmit={handleCommentSubmit}
                            >
                                <div className="comment-input-container">
                                    <div className="user-avatar-small">
                                        {getUserInitial()}
                                    </div>
                                    <input
                                        type="text"
                                        className="comment-input"
                                        placeholder="Escreva um comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button 
                                        type="submit"
                                        className="comment-submit-btn"
                                        disabled={!newComment.trim()}
                                    >
                                        Comentar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </article>
            </div>
        </div>
    );
}

export default Post;
