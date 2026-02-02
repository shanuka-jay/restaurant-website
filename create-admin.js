const bcrypt = require('bcryptjs');
const { dbRun } = require('./config/database');

async function createAdmin() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await dbRun(
        'INSERT INTO users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin', 'User', 'admin@bellacucina.com', '+1-555-000-0000', hashedPassword, 'admin']
    );
    
    console.log('✅ Admin user created!');
    console.log('Email: admin@bellacucina.com');
    console.log('Password: admin123');
    process.exit(0);
}

createAdmin().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});