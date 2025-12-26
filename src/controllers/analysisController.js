import { Visitor } from '../model/Visitor.js'
import { Room } from '../model/Room.js'
import mongoose from 'mongoose';

const getDailyVolume = async (req, res) => {
  try {
    const companyId = req.tenantId || req.user?.tenantId;

    // 1. Correctly find the start of the current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // 2. Aggregate Data
    const stats = await Visitor.aggregate([
      {
        $match: {
          // IMPORTANT: Ensure your DB field is 'companyId' and not 'tenantId'
          companyId: new mongoose.Types.ObjectId(companyId), 
          createdAt: { $gte: startOfWeek } 
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) to 7 (Sat)
          count: { $sum: 1 }
        }
      }
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const workWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    // 3. Map results to Recharts format
    const data = workWeek.map((dayName) => {
      // MongoDB $dayOfWeek: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
      const dbEntry = stats.find(item => dayNames[item._id - 1] === dayName);
      
      return {
        name: dayName,
        volume: dbEntry ? dbEntry.count : 0
      };
    });

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getTotalCheckIns = async (req,res) => {
    try {
        const companyId = req.tenantId || req.user?.tenantId;

        const checkIns = await Visitor.find({ companyId: companyId })

        if (checkIns.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'No visitors booked yet for this business.',
                data: [] 
            });
        }
       
         return res.status(200).json({ 
            success: true, 
            count: checkIns.length,
        });

    } catch (error) {
         return res.status(500).json({ 
            success: false,
            message: `Error while reading database: ${error.message}` 
        });
    }
}
const getRoomsStats = async (req,res) => {
    try {
        const companyId = req.tenantId || req.user?.tenantId;
        
                
        const rooms = await Room.find({ companyId: companyId });


        
        if (rooms.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'No rooms registered for this business.',
                data: [] 
            });
        }

        const statsData = rooms.map(room => ({
            name: room.roomNumber,             
            value: room.numberOfTimesBooked || 0 
        }));

        // 4. Success Response
        return res.status(200).json({ 
            success: true, 
            count: rooms.length,
            data: statsData 
        });
        
    }catch (error) {
        return res.status(500).json({ 
            success: false,
            message: `Error while reading database: ${error.message}` 
        });
    }
}
const getRecentCkeckIns = async (req, res) => {
    try {
        const companyId = req.tenantId || req.user?.tenantId;

        const visitors = await Visitor.find({
            companyId: companyId 
        })
        .sort({ createdAt: -1 }) 
          .limit(5)
          .populate('roomId','roomNumber')
          
          ; 

        return res.status(200).json({
            success: true,
            count: visitors.length,
            data: visitors
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error fetching recent activity: ${error.message}`
        });
    }
};
const getAverageStayTime = async (req, res) => {
  try {
    const companyId = req.tenantId || req.user?.tenantId;

    const stats = await Visitor.aggregate([
      {
        $match: {
          companyId: companyId,
          status: 'checked-out', // Only calculate for visitors who have left
          checkedOutAt: { $exists: true } 
        }
      },
      {
        $project: {
          // Calculate duration in minutes: (CheckOut - CheckIn) / (1000 * 60)
          durationMinutes: {
            $divide: [
              { $subtract: ["$checkedOutAt", "$createdAt"] },
              1000 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageMinutes: { $avg: "$durationMinutes" }
        }
      }
    ]);

    // If no data, return 0
    const average = stats.length > 0 ? Math.round(stats[0].averageMinutes) : 0;

    return res.status(200).json({
      success: true,
      averageMinutes: average,
      formattedStayTime: `${Math.floor(average / 60)}h ${average % 60}m`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export{getDailyVolume,getRecentCkeckIns,getRoomsStats,getTotalCheckIns,getAverageStayTime}