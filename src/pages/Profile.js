import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { profileAPI, postsAPI } from '../service/api';
import './profile.scss';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentUser } = useUser();
  const { isDarkMode } = useTheme();
  
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadProfileData();
  }, [userId, isAuthenticated, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileResponse = await profileAPI.getUserProfile(userId);
      if (profileResponse.success) {
        setProfileUser(profileResponse.data);
        
        // Check if this is the current user's profile
        setIsOwnProfile(user?.id === profileResponse.data.user_id_reg);
      }

      // Load user posts
      const postsResponse = await postsAPI.getUserPosts(profileResponse.data.id);
      if (postsResponse.success) {
        setUserPosts(postsResponse.data);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      
      const response = await profileAPI.uploadProfileImage(file);

      if (response.success) {
        // Update profile user data
        setProfileUser(prev => ({
          ...prev,
          user_image_bucket: response.data.fileName
        }));
        
        // Update current user context if it's the same user
        if (isOwnProfile && currentUser) {
          currentUser.userData.user_image_bucket = response.data.fileName;
        }
        
        alert('Imagem de perfil atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Usa a signed URL retornada pelo backend
  const getProfileImageUrl = () => {
    return profileUser?.user_image_url || null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`profile-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loading">Carregando perfil...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className={`profile-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="error">Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <div className={`profile-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-image-container">
            {getProfileImageUrl() ? (
              <img 
                src={getProfileImageUrl()} 
                alt="Foto de perfil" 
                className="profile-image"
              />
            ) : (
              <div className="profile-image-placeholder">
                {profileUser.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            
            {isOwnProfile && (
              <div className="image-upload-overlay">
                <label htmlFor="image-upload" className="upload-button">
                  {uploadingImage ? 'Enviando...' : 'Alterar foto'}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingImage}
                />
              </div>
            )}
          </div>
          
          <div className="profile-details">
            <h1 className="profile-name">{profileUser.displayName}</h1>
            <p className="profile-joined">
              Membro desde {formatDate(profileUser.created_at)}
            </p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{userPosts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="posts-section">
          <h2>Posts de {profileUser.displayName}</h2>
          
          {userPosts.length === 0 ? (
            <div className="no-posts">
              <p>Este usuário ainda não fez nenhum post.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {userPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-content">
                    <p className="post-description">{post.description}</p>
                    {post.image_url && (
                      <div className="post-image">
                        <img 
                          src={post.image_url}
                          alt="Post"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="post-meta">
                    <div className="post-stats">
                      <span className="likes">❤️ {post.likes}</span>
                      <span className="comments">💬 {post.comments}</span>
                    </div>
                    <div className="post-date">
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                  
                  <button 
                    className="view-post-btn"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    Ver post completo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
