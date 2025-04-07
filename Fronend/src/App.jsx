import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import axios from "axios";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emotionData, setEmotionData] = useState([]);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false); // State for tracking if the script is running

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} April ${currentDate.getFullYear()} at ${String(
    currentDate.getHours()
  ).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(2, "0")}`;

  useEffect(() => {
    const fetchEmotionData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/emotions");
        console.log("Response:", response);
        if (Array.isArray(response.data)) {
          const formattedData = response.data.map(({ emotionType, count }) => ({
            name: emotionType,
            value: count,
            color: getColorForEmotion(emotionType), // Assign color for each emotion
          }));
          setEmotionData(formattedData);
        } else {
          console.error("Invalid data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred while fetching emotion data: " + error.message);
      }
    };

    fetchEmotionData();
    const interval = setInterval(fetchEmotionData, 3000); // Fetch data every 3 seconds
    return () => clearInterval(interval);
  }, [isDarkMode]); // Re-run effect when isDarkMode changes

  const getColorForEmotion = (name) => {
    // Dark Mode and Light Mode color scheme
    const colors = {
      neutral: isDarkMode ? "#78909C" : "#B0BEC5",
      happy: isDarkMode ? "#FFEB3B" : "#FFEB3B",
      sad: isDarkMode ? "#1E88E5" : "#1E88E5",
      fear: isDarkMode ? "#4CAF50" : "#4CAF50",
      disgust: isDarkMode ? "#FF9800" : "#FF9800",
      angry: isDarkMode ? "#E53935" : "#D32F2F",
      surprise: isDarkMode ? "#9C27B0" : "#9C27B0",
    };

    return colors[name] || (isDarkMode ? "#757575" : "#BDBDBD"); // Default color for unrecognized emotion
  };

  const totalPeople = emotionData.reduce((sum, e) => sum + e.value, 0);
  const chartData = emotionData.filter((e) => e.value > 0);

  const runPythonScript = async () => {
    setIsRunning(true); // Set isRunning to true when starting the script
    try {
      await axios.post("http://localhost:3000/api/runpython");
    } catch (error) {
      console.error("Error running Python script:", error);
      alert("Failed to run Python script: " + error.message);
    }
  };

  const stopPythonScript = async () => {
    setIsRunning(false); // Set isRunning to false when stopping the script
    try {
      await axios.post("http://localhost:3000/api/stoppython");
    } catch (error) {
      console.error("Error stopping Python script:", error);
      alert("Failed to stop Python script: " + error.message);
    }
  };

  return (
    <div
      style={{
        ...styles.fullscreen,
        backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
        overflowY: "auto",
        height: "100vh",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* Sticky navbar */}
      <div
        style={{
          ...styles.header,
          backgroundColor: isDarkMode ? "#1E88E5" : "#2196F3",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h2 style={{ ...styles.headerText, color: "#FFFFFF" }}>Emotion Dashboard</h2>
        <div>
          <button
            style={styles.darkModeButton}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <span style={{ color: "white" }}>
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          <button
            style={styles.stopButton}
            onClick={isRunning ? stopPythonScript : runPythonScript}
          >
            {isRunning ? "Stop Script" : "Start Script"}
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <p
          style={{
            ...styles.date,
            color: isDarkMode ? "#BDBDBD" : "#757575",
          }}
        >
          {formattedDate}
        </p>

        {error && <div style={styles.error}>{error}</div>} {/* Display error message */}

        <div style={styles.topSection}>
          <div
            style={{
              ...styles.totalBox,
              backgroundColor: isDarkMode ? "#673AB7" : "#673AB7",
            }}
          >
            <div style={styles.totalLabel}>
              <span style={{ ...styles.totalLabelText, color: "#FFFFFF" }}>
                Total People
              </span>
            </div>
            <span style={{ ...styles.totalCount, color: "#FFFFFF" }}>
              {totalPeople}
            </span>
          </div>
        </div>

        {/* Combined Emotion Distribution and Emotion Breakdown in one box */}
        <div
          style={{
            ...styles.chartSection,
            backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
            display: "flex", // Flexbox to arrange side by side
            justifyContent: "center", // Center content
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "2px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            width: "100%", // Ensure it spans full width
          }}
        >
          <div style={{ width: "48%" }}>
            <h3
              style={{
                ...styles.sectionTitle,
                color: isDarkMode ? "#BB86FC" : "#3F51B5",
              }}
            >
              Emotion Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={3}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const percent = ((value / totalPeople) * 100).toFixed(1);
                    return [`${value} People`, `${percent}%`];
                  }}
                  labelFormatter={(label) => label}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ marginTop: 20 }}
                  formatter={(value) => (
                    <span
                      style={{
                        ...styles.legendText,
                        color: isDarkMode ? "#BDBDBD" : "#757575",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ width: "48%" }}>
            <h3
              style={{
                ...styles.sectionTitle,
                color: isDarkMode ? "#BB86FC" : "#3F51B5",
              }}
            >
              Emotion Breakdown
            </h3>
            <div style={styles.emotionGrid}>
              {emotionData.map((emotion) => (
                <div
                  key={emotion.name}
                  style={{
                    ...styles.emotionBlock,
                    backgroundColor: emotion.color, // Apply color dynamically
                  }}
                >
                  <span style={{ ...styles.emotionName, color: "#FFFFFF" }}>
                    {emotion.name}
                  </span>
                  <span style={{ ...styles.emotionCount, color: "#FFFFFF" }}>
                    {emotion.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated styles
const styles = {
  fullscreen: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    top: 0,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  headerText: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },
  darkModeButton: {
    backgroundColor: "#333",
    padding: "8px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
    marginRight: "10px", // Add spacing between buttons
  },
  stopButton: {
    backgroundColor: "#E53935",
    padding: "8px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  },
  content: { padding: "20px" },
  date: {
    fontSize: "14px",
    marginBottom: "20px",
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "16px",
  },
  topSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
  totalBox: {
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    width: "300px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  totalLabel: {
    marginBottom: "10px",
  },
  totalLabelText: {
    fontSize: "18px",
  },
  totalCount: {
    fontSize: "36px",
    fontWeight: "bold",
  },
  chartSection: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    width: "100%", // Ensure it spans full width
    height: "100%", // Ensure it spans full height of the viewport
  },
  emotionGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emotionBlock: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    padding: "10px",
    marginBottom: "5px",
    borderRadius: "5px",
  },
  emotionName: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  emotionCount: {
    fontSize: "16px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
    textAlign: "center",
  },
  legendText: {
    fontSize: "14px",
  },
};

export default App;
