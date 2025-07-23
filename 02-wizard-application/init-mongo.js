// MongoDB initialization script
db = db.getSiblingDB('wizard_app');

// Create collections and indexes
db.createCollection('quoterequests');

// Create indexes for better performance
db.quoterequests.createIndex({ sessionId: 1 }, { unique: true });
db.quoterequests.createIndex({ status: 1 });
db.quoterequests.createIndex({ createdAt: 1 });

print('✅ Database wizard_app initialized successfully!');
