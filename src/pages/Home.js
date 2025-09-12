import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { postsAPI } from '../service/api';
import Header from '../components/Header';
import UserCard from '../components/UserCard';
import Feed from '../components/Feed';
import RightSidebar from '../components/RightSidebar';
import './home.scss'

function Home() {
    const { user, logout } = useAuth();
    const { getUserDisplayName } = useUser();
    const [newPost, setNewPost] = useState('');


    const handleLogout = () => {
        logout();
    };


    console.log('User data:', user);

    return (
        <div className="mood-app">
            <Header user={user} onLogout={handleLogout} />
            
            <main className="mood-main">
                <aside className="left-sidebar">
                    <UserCard user={user} />
                </aside>

                <section className="main-feed">
                    <Feed 
                        user={user}
                        newPost={newPost}
                        setNewPost={setNewPost}
                    />
                </section>

                <aside className="right-sidebar">
                    <RightSidebar />
                </aside>
            </main>
        </div>
    );
}

export default Home;