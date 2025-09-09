import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../service/api';

function RightSidebar() {
    const navigate = useNavigate();
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);

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

    const getAuthorInitial = (authorName) => {
        return authorName.charAt(0).toUpperCase();
    };

    const getUserInitial = (userName) => {
        return userName.charAt(0).toUpperCase();
    };

    // Fetch trending posts
    const fetchTrendingPosts = async () => {
        try {
            setLoadingTrending(true);
            const response = await searchAPI.getTrendingPosts(5);
            if (response.success) {
                const formattedPosts = response.data.map(post => ({
                    ...post,
                    author: post.usersData?.displayName || 'Usuário (Erro ao buscar nome)',
                    time: formatTime(post.created_at),
                    content: post.description
                }));
                setTrendingPosts(formattedPosts);
            }
        } catch (error) {
            console.error('Error fetching trending posts:', error);
        } finally {
            setLoadingTrending(false);
        }
    };


    // Handle trending post click
    const handleTrendingPostClick = (postId) => {
        navigate(`/post/${postId}`);
    };


    useEffect(() => {
        fetchTrendingPosts();
    }, []);

    return (
        <aside className="right-sidebar">
            <div className="trending-card">
                <div className="card-title">🔥 Em Alta</div>
                {loadingTrending ? (
                    <div className="loading-message">
                        <div className="loading-spinner">⏳</div>
                        <span>Carregando...</span>
                    </div>
                ) : trendingPosts.length > 0 ? (
                    trendingPosts.map(post => (
                        <div 
                            key={post.id} 
                            className="trending-item"
                            onClick={() => handleTrendingPostClick(post.id)}
                        >
                            <div className="trending-icon">❤️</div>
                            <div className="trending-content">
                                <div className="trending-text">
                                    {post.content.length > 40 
                                        ? `${post.content.substring(0, 40)}...` 
                                        : post.content
                                    }
                                </div>
                                <div className="trending-meta">
                                    {post.likes} curtidas • {post.time}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-message">
                        <span>Nenhum post em alta</span>
                    </div>
                )}
            </div>

        </aside>
    );
}

export default RightSidebar;
