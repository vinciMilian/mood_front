import React from 'react';
import { useUser } from '../contexts/UserContext';

function UserCard({ user }) {
    const { 
        userData, 
        loading, 
        getUserDisplayName, 
        getUserInitial, 
        getUserCreatedAt 
    } = useUser();

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

    return (
        <div className="user-card">
            <div className="user-info">
                <div className="user-avatar-large">
                    {getUserInitial()}
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
            </div>
        </div>
    );
}

export default UserCard;
