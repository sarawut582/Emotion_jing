const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subMinutes } = require('date-fns'); 

// API รับข้อมูล Emotion
exports.receiveEmotion = async (req, res) => {
  const { emotions, time } = req.body;

  if (!emotions || typeof emotions !== "object" || !time) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    console.log('Received emotions:', emotions);

    // ลบข้อมูลเก่าทั้งหมดก่อนการอัพเดทใหม่
    await prisma.emotion.deleteMany({});

    // เพิ่มข้อมูลใหม่ที่ได้รับจาก AI
    const updates = Object.entries(emotions).map(async ([emotionType, count]) => {
      return prisma.emotion.create({
        data: {
          emotionType,
          count,
          receivedAt: new Date(time),
        },
      });
    });

    const results = await Promise.all(updates);
    console.log('Emotion update results:', results);
    res.status(200).json({ message: "All emotions updated", data: results });
  } catch (error) {
    console.error('Error in receiveEmotion:', error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// API ดึงข้อมูล Emotion ทั้งหมด
exports.getEmotionCounts = async (req, res) => {
  try {
    const cutoffTime = subMinutes(new Date(), 10); // อัปเดตข้อมูลภายใน 10 นาทีล่าสุด
    console.log('Fetching emotions after:', cutoffTime);
    
    const emotions = await prisma.emotion.findMany({
      where: {
        receivedAt: { gte: cutoffTime }
      },
    });
    
    console.log('Fetched emotions:', emotions);
    res.status(200).json(emotions);
  } catch (error) {
    console.error('Error in getEmotionCounts:', error);
    res.status(500).json({ error: "Unable to fetch emotions", details: error.message });
  }
};
