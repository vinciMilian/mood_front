import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { postsAPI, likesAPI, commentsAPI, storageAPI, adminAPI, userAPI } from '../service/api';

function Feed({ user, newPost, setNewPost, onPostSubmit }) {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { getUserDisplayName } = useUser();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const [userLikes, setUserLikes] = useState(new Set());
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [imageUrls, setImageUrls] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

    const getUserInitial = () => {
        const name = getUserDisplayName();
        return name.charAt(0).toUpperCase();
    };

    const getAuthorInitial = (authorName) => {
        return authorName?.charAt(0).toUpperCase() || '?';
    } 

    const handleAuthorClick = (post) => {
        if (post.usersData?.user_id_reg) {
            navigate(`/profile/${post.usersData.user_id_reg}`);
        }
    };

    // Check if user is admin
    const checkAdminStatus = () => {
        if (authUser?.id) {
            const adminId = '8edd0212-1a9e-4a5a-a361-2f4411f32e26';
            setIsAdmin(authUser.id === adminId);
        }
    };

    // Pin/Unpin post
    const handlePinPost = async (postId, isPinned) => {
        try {
            const response = isPinned 
                ? await adminAPI.unpinPost(postId)
                : await adminAPI.pinPost(postId);
            
            if (response.success) {
                // Refresh posts to show updated pin status
                fetchPosts(true);
            }
        } catch (error) {
            console.error('Error pinning/unpinning post:', error);
        }
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

    // Handle image selection
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                return;
            }
            
            setSelectedImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload image to Supabase Storage
    const uploadImage = async (file, userId) => {
        try {
            // Get the access token from localStorage
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            // Import Supabase client
            const { createSupabaseClient, SUPABASE_CONFIG } = await import('../config/supabase');
            const supabase = createSupabaseClient(token);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomString}.${fileExtension}`;

            const { data, error } = await supabase.storage
                .from(SUPABASE_CONFIG.bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            return data.path;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Fetch posts from database
    const fetchPosts = useCallback(async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setOffset(0);
            } else {
                setLoadingMore(true);
            }

            const currentOffset = reset ? 0 : offset;
            const response = await postsAPI.getPosts(10, currentOffset);
            
            if (response.success) {
                const newPosts = response.data.map(post => ({
                    ...post,
                    author: post.usersData?.displayName || 'Usuário',
                    user_image_bucket: post.usersData?.user_image_bucket || null,
                    time: formatTime(post.created_at),
                    content: post.description
                }));

                if (reset) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }
                
                // Load image URLs for posts with images
                newPosts.forEach(post => {
                    if (post.image_id_bucket) {
                        loadImageUrl(post.id, post.image_id_bucket);
                    }
                });
                
                setHasMore(response.pagination.hasMore);
                setOffset(currentOffset + 10);
            } else {
                setError('Erro ao carregar posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Erro ao carregar posts');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [offset]);

    // Check if user liked posts
    const checkUserLikes = useCallback(async () => {
        if (!authUser || posts.length === 0) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const likePromises = posts.map(post => 
                likesAPI.checkUserLiked(post.id, token)
            );
            
            const likeResults = await Promise.all(likePromises);
            const likedPostIds = new Set();
            
            likeResults.forEach((result, index) => {
                if (result.success && result.data.liked) {
                    likedPostIds.add(posts[index].id);
                }
            });
            
            setUserLikes(likedPostIds);
        } catch (err) {
            console.error('Error checking user likes:', err);
        }
    }, [authUser, posts]);

    // Handle like toggle
    const handleLike = async (postId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const response = await likesAPI.toggleLike(postId, token);
            
            if (response.success) {
                // Update local state
                setPosts(prev => prev.map(post => 
                    post.id === postId 
                        ? { 
                            ...post, 
                            likes: response.data.liked 
                                ? post.likes + 1 
                                : post.likes - 1 
                          }
                        : post
                ));

                // Update user likes
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

    // Fetch comments for a post
    const fetchComments = async (postId) => {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        try {
            const response = await commentsAPI.getPostComments(postId, 20, 0);
            if (response.success) {
                const formattedComments = response.data.map(comment => ({
                    ...comment,
                    author: comment.usersData?.displayName || 'Usuário',
                    time: formatTime(comment.created_at),
                    content: comment.comment_content
                }));
                setComments(prev => ({ ...prev, [postId]: formattedComments }));
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    // Toggle comments visibility
    const toggleComments = (postId) => {
        setShowComments(prev => {
            const newShowComments = { ...prev, [postId]: !prev[postId] };
            // Fetch comments if showing for the first time
            if (newShowComments[postId] && !comments[postId]) {
                fetchComments(postId);
            }
            return newShowComments;
        });
    };

    // Handle comment submission
    const handleCommentSubmit = async (postId, e) => {
        e.preventDefault();
        const commentText = newComments[postId];
        if (!commentText || !commentText.trim()) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const response = await commentsAPI.createComment(postId, commentText.trim(), token);
            if (response.success) {
                // Clear the input
                setNewComments(prev => ({ ...prev, [postId]: '' }));
                // Refresh comments
                fetchComments(postId);
                // Update post comments count
                setPosts(prev => prev.map(post => 
                    post.id === postId 
                        ? { ...post, comments: post.comments + 1 }
                        : post
                ));
            }
        } catch (err) {
            console.error('Error creating comment:', err);
        }
    };

    // Handle comment input change
    const handleCommentChange = (postId, value) => {
        setNewComments(prev => ({ ...prev, [postId]: value }));
    };

    // Copy share link
    const copyShareLink = async (postId) => {
        const shareUrl = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copiado para a área de transferência!');
        } catch (err) {
            console.error('Error copying link:', err);
            alert('Erro ao copiar link');
        }
    };

    // Load image URL for a post
    const loadImageUrl = async (postId, imageIdBucket) => {
        if (!imageIdBucket || imageUrls[postId]) return;
        
        console.log('Loading image URL for post:', postId, 'image:', imageIdBucket);
        
        try {
            // Try to get signed URL directly from Supabase
            const token = localStorage.getItem('accessToken');
            if (token) {
                const { createSupabaseClient, SUPABASE_CONFIG } = await import('../config/supabase');
                const supabase = createSupabaseClient(token);

                const { data, error } = await supabase.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .createSignedUrl(imageIdBucket, 3600);

                if (error) {
                    console.error('Error creating signed URL:', error);
                    // Fallback to direct URL
                    const { getDirectImageUrl } = await import('../config/supabase');
                    const directUrl = getDirectImageUrl(imageIdBucket);
                    setImageUrls(prev => ({ ...prev, [postId]: directUrl }));
                } else {
                    console.log('Signed URL created:', data.signedUrl);
                    setImageUrls(prev => ({ ...prev, [postId]: data.signedUrl }));
                }
            } else {
                // No token, use direct URL
                const { getDirectImageUrl } = await import('../config/supabase');
                const directUrl = getDirectImageUrl(imageIdBucket);
                setImageUrls(prev => ({ ...prev, [postId]: directUrl }));
            }
        } catch (err) {
            console.error('Error loading image URL:', err);
            // Fallback to direct URL
            const { getDirectImageUrl } = await import('../config/supabase');
            const directUrl = getDirectImageUrl(imageIdBucket);
            setImageUrls(prev => ({ ...prev, [postId]: directUrl }));
        }
    };

    // Load more posts on scroll
    const handleScroll = useCallback(() => {
        if (loadingMore || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 1000) {
            fetchPosts(false);
        }
    }, [loadingMore, hasMore, fetchPosts]);

    // Initial load
    useEffect(() => {
        fetchPosts(true);
    }, []);

    // Check admin status when authUser changes
    useEffect(() => {
        checkAdminStatus();
    }, [authUser]);

    // Check user likes when posts change
    useEffect(() => {
        checkUserLikes();
    }, [checkUserLikes]);

    // Add scroll listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Handle post submission with image
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim() && !selectedImage) return;

        setUploading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('No access token found');
                return;
            }

            let imageIdBucket = null;
            
            // Upload image if selected
            if (selectedImage) {
                try {
                    imageIdBucket = await uploadImage(selectedImage, authUser.id);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Erro ao fazer upload da imagem. Tente novamente.');
                    setUploading(false);
                    return;
                }
            }

            // Create post
            const response = await postsAPI.createPost(newPost.trim(), imageIdBucket, token);
            
            if (response.success) {
                console.log('Post created successfully:', response.data);
                setNewPost('');
                setSelectedImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Refresh posts to show the new one
                fetchPosts(true);
            } else {
                console.error('Error creating post:', response.message);
                alert('Erro ao criar post. Tente novamente.');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Erro ao criar post. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="main-feed">
            {/* Create Post */}
            <div className="create-post">
                <form onSubmit={handlePostSubmit}>
                    <div className="post-input">
                        <div className="user-avatar-small">
                            {getUserInitial()}
                        </div>
                        <div className="post-input-content">
                            <div className="user-name-display">
                                <span className="user-name">{getUserDisplayName()}</span>
                            </div>
                            <textarea
                                className="post-textarea"
                                placeholder="No que você está pensando?"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                            <button 
                                type="button" 
                                className="remove-image-btn"
                                onClick={removeImage}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    
                    <div className="post-actions">
                        <div className="action-btn" onClick={() => fileInputRef.current?.click()}>
                            <div className="action-icon">📸</div>
                            <span>Foto</span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />
                        <button 
                            type="submit" 
                            className="post-btn"
                            disabled={uploading || (!newPost.trim() && !selectedImage)}
                        >
                            {uploading ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Feed Posts */}
            <div className="feed-posts">
                {loading ? (
                    <div className="loading-message">
                        <div className="loading-spinner">⏳</div>
                        <p>Carregando posts...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <div className="error-icon">❌</div>
                        <p>{error}</p>
                        <button onClick={() => fetchPosts(true)} className="retry-btn">
                            Tentar novamente
                        </button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-message">
                        <div className="empty-icon">😔</div>
                        <p>Não há posts</p>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
                            <article key={post.id} className={`post-card ${post.is_pinned ? 'pinned' : ''}`}>
                                <div className="post-header">
                                    <div className="post-user-info">
                                        <div className="post-avatar">
                                            {post.user_image_url ? (
                                                <img 
                                                    src={post.user_image_url}
                                                    alt="Avatar"
                                                    className="avatar-img"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                getAuthorInitial(post.author)
                                            )}
                                        </div>
                                        <div className="post-info">
                                            <div 
                                                className="post-author" 
                                                onClick={() => handleAuthorClick(post)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {post.author}
                                                {post.usersData?.user_email === 'plsmartins10@gmail.com' && (
                                                    <span className="admin-tag">Admin</span>
                                                )}
                                            </div>
                                            <div className="post-time">{post.time}</div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button 
                                            className="pin-btn"
                                            onClick={() => handlePinPost(post.id, post.is_pinned)}
                                            title={post.is_pinned ? 'Desfixar post' : 'Fixar post'}
                                        >
                                            {post.is_pinned ? '📌' : '📍'}
                                        </button>
                                    )}
                                </div>
                                <div className="post-content">
                                    {post.content}
                                </div>
                                {post.image_id_bucket && (
                                    <div className="post-image">
                                        {imageUrls[post.id] ? (
                                            <img 
                                                src={imageUrls[post.id]}
                                                alt="Post image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="image-loading">
                                                <div className="loading-spinner">⏳</div>
                                                <span>Carregando imagem...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="post-actions">
                                    <button 
                                        className={`action-btn ${userLikes.has(post.id) ? 'liked' : ''}`}
                                        onClick={() => handleLike(post.id)}
                                    >
                                        <div className="action-icon">
                                            {userLikes.has(post.id) ? '❤️' : '🤍'}
                                        </div>
                                        <span>{post.likes}</span>
                                    </button>
                                    <button 
                                        className="action-btn"
                                        onClick={() => toggleComments(post.id)}
                                    >
                                        <div className="action-icon">💬</div>
                                        <span>{post.comments}</span>
                                    </button>
                                    <button 
                                        className="action-btn"
                                        onClick={() => copyShareLink(post.id)}
                                    >
                                        <div className="action-icon">🔗</div>
                                        <span>Compartilhar</span>
                                    </button>
                                </div>
                                
                                {/* Comments Section */}
                                {showComments[post.id] && (
                                    <div className="comments-section">
                                        {/* Comments List */}
                                        <div className="comments-list">
                                            {loadingComments[post.id] ? (
                                                <div className="loading-comments">
                                                    <div className="loading-spinner">⏳</div>
                                                    <span>Carregando comentários...</span>
                                                </div>
                                            ) : comments[post.id] && comments[post.id].length > 0 ? (
                                                comments[post.id].map(comment => (
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
                                            onSubmit={(e) => handleCommentSubmit(post.id, e)}
                                        >
                                            <div className="comment-input-container">
                                                <div className="user-avatar-small">
                                                    {getUserInitial()}
                                                </div>
                                                <input
                                                    type="text"
                                                    className="comment-input"
                                                    placeholder="Escreva um comentário..."
                                                    value={newComments[post.id] || ''}
                                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                />
                                                <button 
                                                    type="submit"
                                                    className="comment-submit-btn"
                                                    disabled={!newComments[post.id] || !newComments[post.id].trim()}
                                                >
                                                    Comentar
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </article>
                        ))}
                        
                        {/* Loading more indicator */}
                        {loadingMore && (
                            <div className="loading-more">
                                <div className="loading-spinner">⏳</div>
                                <p>Carregando mais posts...</p>
                            </div>
                        )}
                        
                        {/* No more posts message */}
                        {!hasMore && posts.length > 0 && (
                            <div className="no-more-posts">
                                <div className="no-more-icon">😞</div>
                                <p>Sem mais posts</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default Feed;
