import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function UserCard({ user }) {
    const navigate = useNavigate();
    const { 
        userData, 
        loading, 
        getUserDisplayName, 
        getUserInitial, 
        getUserCreatedAt 
    } = useUser();

    const handleProfileClick = () => {
        if (user?.id) {
            navigate(`/profile/${user.id}`);
        }
    };

    console.log("NOME: ", getUserDisplayName)

    if (loading) {
        return (
            <div className="user-card">
                <div className="user-info">
                    <div className="user-avatar-large">...</div>
                    <div className="user-name">Carregando...</div>
                </div>
            </div>
        );
    }

    const getProfileImageUrl = () => {
        return userData?.user_image_url || user?.user_image_url || null;
    };

    return (
        <div className="user-card" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <div className="user-info">
                <div className="user-avatar-large">
                    {getProfileImageUrl() ? (
                        <img src={getProfileImageUrl()} alt="Foto de perfil" className="profile-image" />
                    ) : (
                        getUserInitial()
                    )}
                </div>
                <div className="user-name">
                    {getUserDisplayName()}
                </div>
                <div className="user-email">
                    {user.email}
                </div>
                <div className="user-created-at">
                    Membro desde {getUserCreatedAt()}
                </div>
                <div className="profile-link">
                    Ver perfil →
                </div>
            </div>
        </div>
    );
}

export default UserCard;
