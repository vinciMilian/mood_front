import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../service/api';
import { useUser } from '../contexts/UserContext';
import ThemeToggle from './ThemeToggle';

function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const { userData } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const resultsRef = useRef(null);

    const getUserInitial = () => {
        const name = userData?.displayName || user.userData?.displayName || user.name || user.email?.split('@')[0] || 'U';
        return name.charAt(0).toUpperCase();
    };

    // Foto de perfil do usuário logado
    const getProfileImageUrl = () => {
        return userData?.user_image_url || user?.user_image_url || null;
    };

    // Handle search
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults({ posts: [], users: [] });
            setShowResults(false);
            return;
        }

        setLoading(true);
        try {
            const [postsResponse, usersResponse] = await Promise.all([
                searchAPI.searchPosts(query, 5, 0),
                searchAPI.searchUsers(query, 5, 0)
            ]);

            setSearchResults({
                posts: postsResponse.success ? postsResponse.data : [],
                users: usersResponse.success ? usersResponse.data : []
            });
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // Debounce search
        clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            handleSearch(query);
        }, 300);
    };

    // Handle result click
    const handleResultClick = (type, item) => {
        if (type === 'post') {
            navigate(`/post/${item.id}`);
        } else if (type === 'user') {
            // Navigate to user profile (implement later)
            console.log('Navigate to user:', item);
        }
        setShowResults(false);
        setSearchQuery('');
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="mood-header">
            <div className="header-container" style={{ height: '30px' }}>
                <div className="logo-section">
                    <a href="#" className="mood-logo">mood</a>
                </div>
                
                <div className="search-section" ref={resultsRef}>
                    <input 
                        type="text" 
                        className="search-bar" 
                        placeholder="Pesquisar no Mood..."
                        value={searchQuery}
                        onChange={handleSearchChange}

                        style={{ height: '30px', color: 'black' }}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showResults && (searchResults.posts.length > 0 || searchResults.users.length > 0) && (
                        <div className="search-results">
                            {loading && (
                                <div className="search-loading">
                                    <div className="loading-spinner">⏳</div>
                                    <span>Pesquisando...</span>
                                </div>
                            )}
                            
                            {!loading && (
                                <>
                                    {searchResults.posts.length > 0 && (
                                        <div className="search-section-results">
                                            <div className="search-section-title">Posts</div>
                                            {searchResults.posts.map(post => (
                                                <div 
                                                    key={post.id} 
                                                    className="search-result-item"
                                                    onClick={() => handleResultClick('post', post)}
                                                >
                                                    <div className="search-result-icon">📝</div>
                                                    <div className="search-result-content">
                                                        <div className="search-result-title">
                                                            {post.description.length > 50 
                                                                ? `${post.description.substring(0, 50)}...` 
                                                                : post.description
                                                            }
                                                        </div>
                                                        <div className="search-result-subtitle">
                                                            por {post.usersData?.displayName || 'Usuário'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {searchResults.users.length > 0 && (
                                        <div className="search-section-results">
                                            <div className="search-section-title">Usuários</div>
                                            {searchResults.users.map(user => (
                                                <div 
                                                    key={user.id} 
                                                    className="search-result-item"
                                                    onClick={() => handleResultClick('user', user)}
                                                >
                                                    <div className="search-result-icon">👤</div>
                                                    <div className="search-result-content">
                                                        <div className="search-result-title">{user.displayName}</div>
                                                        <div className="search-result-subtitle">
                                                            Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="user-section">
                    <ThemeToggle />
                    <div className="user-avatar">
                        {getProfileImageUrl() ? (
                            <img src={getProfileImageUrl()} alt="Foto de perfil" className="profile-image" />
                        ) : (
                            getUserInitial()
                        )}
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
