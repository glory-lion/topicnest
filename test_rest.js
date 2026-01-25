const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dnkzpufpttsunuqybzcx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRua3pwdWZwdHRzdW51cXliemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDY5MTYsImV4cCI6MjA4NDE4MjkxNn0.KRvJHE4pW71PIxvl73RfbAqwYAZjGH8RNCKJ9ar9m7A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log('Testing Supabase REST API...')
    const { data, error } = await supabase.from('categories').select('*').limit(1)
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Success! Found categories:', data)
    }
}

test()
