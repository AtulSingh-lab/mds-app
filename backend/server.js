const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); // <-- Added this
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser()); // <-- Added this
app.use(cors({ 
  origin: 'http://localhost:5173',   // your frontend URL
  credentials: true 
}));
app.use(helmet()); 
app.use(morgan('dev')); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

app.get('/', (req, res) => {
  res.send('MDS API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});