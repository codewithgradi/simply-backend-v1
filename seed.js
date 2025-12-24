import mongoose from 'mongoose';
import { Notification } from './src/model/Notification.js'; // Adjust path

const companyId = "694a64d780745aafe7436029";

// Sample names to match your visitor data pool
const visitorNames = [
  "James Smith", "Mary Johnson", "John Williams", "Patricia Brown", 
  "Robert Jones", "Jennifer Garcia", "Michael Miller", "Linda Davis",
  "William Rodriguez", "Elizabeth Martinez", "David Hernandez", "Barbara Lopez"
];

async function seedNotifications() {
  const notifications = [];
  const now = new Date();

  // Generate 40 notifications
  for (let i = 0; i < 40; i++) {
    const type = Math.random() > 0.4 ? 'check-in' : 'check-out';
    const visitorName = visitorNames[Math.floor(Math.random() * visitorNames.length)];
    
    // Spread them over the last 24 hours
    const createdAt = new Date(now);
    createdAt.setMinutes(now.getMinutes() - (i * 25)); // Roughly 25 mins apart

    notifications.push({
      companyId: new mongoose.Types.ObjectId(companyId),
      visitorName: visitorName,
      type: type,
      isRead: i > 5, // Make the first 5 "unread" for testing
      createdAt: createdAt
    });
  }

    try {
    const      MONGO_URI="mongodb+srv://gradipuata_db_user:KR2Br5UbiaZaHfCS@cluster0.acbginx.mongodb.net/?appName=Cluster0"

    await mongoose.connect(MONGO_URI);
    
    // Clear old ones if you want a fresh start
    // await Notification.deleteMany({ companyId });

    const result = await Notification.insertMany(notifications);
    console.log(`Successfully generated ${result.length} notifications.`);
    
  } catch (error) {
    console.error("Error seeding notifications:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedNotifications();