import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../service/api';
import ThemeToggle from '../components/ThemeToggle';
import './login.scss'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.signin(email, password);
            
            if (response.success) {
                // Get complete user data including userData from usersData table
                const userResponse = await authAPI.getUser(response.data.session.access_token);
                
                if (userResponse.success) {
                    // Use the complete user data
                    login(userResponse.user, response.data.session.access_token);
                } else {
                    // Fallback to basic user data if getUser fails
                    login(response.data.user, response.data.session.access_token);
                }
                
                // Navigate to home page using React Router
                navigate('/');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
      <div className="login">
        <div className="loginContainer">
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <ThemeToggle />
            </div>
            <form onSubmit={handleLogin}>
                <h2>L O G I N</h2>
                
                {error && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className='registerOption'>
                <p>Não possui uma conta ?</p>
                <button className='btnRegi' type="button" onClick={() => navigate('/register')}>Registrar</button>
            </div>
        </div>
      </div>
    );
  }
  
  export default Login;
  