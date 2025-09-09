const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/auth';

export const authAPI = {
  signup: async (displayName, email, password) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ displayName, email, password }),
    });
    return response.json();
  },

  signin: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getUser: async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Test function to check if server is working
  ping: async () => {
    const response = await fetch(`${API_BASE_URL}/test/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // User Data Management Functions
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/test/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  createUserData: async (userId, displayName) => {
    const response = await fetch(`${API_BASE_URL}/test/create-user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, displayName }),
    });
    return response.json();
  },

  updateUserData: async (userId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return response.json();
  },

  updateDisplayName: async (userId, displayName) => {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}/display-name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ displayName }),
    });
    return response.json();
  },

  deleteUserData: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user-data/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

// Posts API
export const postsAPI = {
  // Get posts with pagination
  getPosts: async (limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/posts?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Create a new post
  createPost: async (description, imageIdBucket = null, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, imageIdBucket }),
    });
    return response.json();
  },

  // Get posts by user
  getUserPosts: async (userId, limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Get single post
  getPost: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Delete post
  deletePost: async (postId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

// Comments API
export const commentsAPI = {
  // Get comments for a post
  getPostComments: async (postId, limit = 20, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Create a comment
  createComment: async (postId, commentText, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentText }),
    });
    return response.json();
  }
};

// Storage API
export const storageAPI = {
  // Get image URL
  getImageUrl: async (fileName) => {
    const response = await fetch(`${API_BASE_URL}/storage/image/${fileName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

// Search API
export const searchAPI = {
  // Search posts
  searchPosts: async (query, limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/search/posts?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Search users
  searchUsers: async (query, limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Get trending posts
  getTrendingPosts: async (limit = 5) => {
    const response = await fetch(`${API_BASE_URL}/posts/trending?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Removed function to get random users
};

// Likes API
export const likesAPI = {
  // Toggle like on a post
  toggleLike: async (postId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  // Check if user liked a post
  checkUserLiked: async (postId, accessToken) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};