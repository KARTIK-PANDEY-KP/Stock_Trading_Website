const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, "pro3/dist/pro3/browser/")));

// Catch-all route to serve the Angular app for any other route
app.get('*', (req, res) => {
    console.log("comin here");
    res.sendFile(path.join(__dirname, 'dist/pro3/browser/index.html'));
});
// Listen on a port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
