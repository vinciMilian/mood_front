require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getUserData } = require('./backend/users_db');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function testUserEndpoint() {
    console.log('Testing /user endpoint logic...');
    
    // Simulate the user ID from Supabase Auth
    const userId = 'cd4cd256-49cb-43dd-8a50-d10e5d8c49a2';
    
    try {
        // This simulates what happens in the /user endpoint
        console.log('1. Getting user data from usersData table...');
        const userDataResult = await getUserData(userId);
        
        if (userDataResult.error) {
            console.log('❌ Error getting user data:', userDataResult.error);
            return;
        }
        
        console.log('✅ User data retrieved successfully');
        console.log('User data:', JSON.stringify(userDataResult.data, null, 2));
        
        // Simulate the user object from Supabase Auth
        const mockAuthUser = {
            id: userId,
            email: 'paulo@teste.com',
            created_at: '2025-09-06T18:33:30.000Z',
            user_metadata: {}
        };
        
        // Combine auth user data with usersData (this is what the endpoint does)
        const userWithData = {
            ...mockAuthUser,
            userData: userDataResult.data || null
        };
        
        console.log('\n2. Combined user object:');
        console.log(JSON.stringify(userWithData, null, 2));
        
        console.log('\n3. Testing display name extraction:');
        const displayName = userWithData.userData?.displayName || 
                           userWithData.user_metadata?.displayName || 
                           userWithData.email?.split('@')[0] || 
                           'Usuário';
        console.log('Display Name:', displayName);
        
        console.log('\n4. Testing created_at extraction:');
        const createdAt = userWithData.userData?.created_at;
        if (createdAt) {
            const date = new Date(createdAt);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            console.log('Created At (formatted):', formattedDate);
        } else {
            console.log('Created At: Data não disponível');
        }
        
    } catch (error) {
        console.log('❌ Exception:', error.message);
    }
}

testUserEndpoint();
