// supabase-client.js - Database connection

const SUPABASE_URL = 'https://adqhhoynbgdpdszqeuwz.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWhob3luYmdkcGRzenFldXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTI2NzEsImV4cCI6MjA4NDE2ODY3MX0.ao_qjzUc9Ne2GMJEWFh0IFLOvFT7gqanKn-DDB-RZbc';

const supabase = {

    async insert(table, data) {
        console.log(`📤 Inserting into ${table}:`, data);
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Insert successful:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Insert error:', error);
            throw error;
        }
    },

    async getAll(table) {
        console.log(`📥 Fetching all from ${table}`);
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`✅ Fetched ${result.length} records from ${table}`);
            return result;
            
        } catch (error) {
            console.error('❌ Fetch error:', error);
            throw error;
        }
    },

    async select(table, filters = {}) {
        let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
        
        for (const [key, value] of Object.entries(filters)) {
            url += `&${key}=eq.${value}`;
        }
        console.log(`📥 Querying ${table} with filters:`, filters);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`✅ Query returned ${result.length} records`);
            return result;
            
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    },

    async selectIn(table, column, values) {
        const valuesList = values.map(v => `"${v}"`).join(',');
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&${column}=in.(${valuesList})`;
        console.log(`📥 Querying ${table} where ${column} IN [...]`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`✅ Query returned ${result.length} records`);
            return result;
            
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }
};

console.log('✅ Supabase client initialized');