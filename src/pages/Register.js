import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../service/api';
import ThemeToggle from '../components/ThemeToggle';
import './register.scss';

function Register() {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        const { displayName, email, password, confirmPassword } = formData;

        if (!displayName || !email || !password || !confirmPassword) {
            setError('Todos os campos são obrigatórios');
            return false;
        }

        if (displayName.length < 2) {
            setError('O nome deve ter pelo menos 2 caracteres');
            return false;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, insira um email válido');
            return false;
        }

        return true;
    };

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Register user in Supabase Auth
            const response = await authAPI.signup(formData.displayName, formData.email, formData.password);
            
            if (response.success) {
                // If user was created successfully, try to create user data
                if (response.data && response.data.user) {
                    console.log('User created in auth:', response.data.user.id);
                    
                    // Create user data in usersData table
                    try {
                        console.log('Attempting to create user data with:', {
                            userId: response.data.user.id,
                            displayName: formData.displayName
                        });
                        
                        const userDataResponse = await authAPI.createUserData(
                            response.data.user.id, 
                            formData.displayName
                        );
                        
                        if (userDataResponse.success) {
                            console.log('User data created successfully:', userDataResponse.data);
                        } else {
                            console.error('Error creating user data:', userDataResponse.error);
                            // Don't fail the registration if user data creation fails
                            // The backend will handle this during login
                        }
                    } catch (userDataError) {
                        console.error('Error creating user data:', userDataError);
                        // Don't fail the registration if user data creation fails
                    }
                }
                
                setSuccess('Conta criada com sucesso! Verifique seu email para confirmar a conta.');
                
                // Clear form
                setFormData({
                    displayName: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                // Redirect to login after successful registration
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.message || 'Erro ao criar conta');
            }
        } catch (err) {
            setError('Erro de rede. Tente novamente.');
            console.error('Register error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register">
            <div className="registerContainer">
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <ThemeToggle />
                </div>
                <form onSubmit={handleRegister}>
                    <h2>Criar Conta</h2>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="displayName">Nome:</label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="Nome do usuário"
                            minLength="2"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="Mínimo 6 caracteres"
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Senha:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="Digite a senha novamente"
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </button>

                    <div className="login-link">
                        <p>Já tem uma conta? <button type="button" onClick={() => navigate('/login')}>Faça login</button></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
