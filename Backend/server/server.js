// server.js (or your main entry file)
const express = require('express');
const bodyParser = require('body-parser');
const emotionRoutes = require('./routers/emontionRouters');  // I see you have a typo here, 'emontionRouters' should be 'emotionRouters'
const runPythonScriptRoutes = require('./routers/runPythonRouters');  // Correct import

const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // เพิ่ม cors middleware
app.use(bodyParser.json());

app.use('/api', emotionRoutes);  // API routes for emotions
app.use('/api', runPythonScriptRoutes);  // API routes for running Python script

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
