const { spawn } = require('child_process');

let pythonProcess = null;  // เก็บ Python process

// API เพื่อรัน Python script
exports.runPythonScript = async (req, res) => {
  try {
    // ถ้ามี Python process ที่กำลังรันอยู่แล้ว
    if (pythonProcess) {
      return res.status(400).json({ message: "Python script is already running" });
    }

    // สั่งรัน Python script
    pythonProcess = spawn('python', ['C:\\CPE\\CPE408\\Emotion_v3\\AiEmotion\\emotion_recognition.py']);
    console.log('Python script started...');

    // ควบคุมการแสดงผลจาก Python
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python Output: ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      pythonProcess = null;  // รีเซ็ตเมื่อ Python process หยุดทำงาน
    });

    res.status(200).json({ message: "Python script executed successfully" });
  } catch (error) {
    console.error('Error running Python script:', error);
    res.status(500).json({ error: "Error running Python script", details: error.message });
  }
};

// API สำหรับหยุด Python script
exports.stopPythonScript = async (req, res) => {
  try {
    // ตรวจสอบว่า Python script กำลังทำงานอยู่หรือไม่
    if (pythonProcess) {
      pythonProcess.kill('SIGINT');  // ส่งสัญญาณ SIGINT (CTRL+C) เพื่อหยุด Python script
      pythonProcess = null;  // รีเซ็ต Python process
      res.status(200).json({ message: "Python script stopped successfully" });
    } else {
      res.status(404).json({ message: "No running Python script to stop" });
    }
  } catch (error) {
    console.error('Error stopping Python script:', error);
    res.status(500).json({ error: "Error stopping Python script", details: error.message });
  }
};
