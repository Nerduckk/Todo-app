require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MySQL
require('./db/init.mysql');

// Routes
app.use('/api/v1', require('./routes'));


//Handle Error

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
  });

app.use((error, req, res, next) => {
    const statusCodes = error.status || 500;
  
    return res.status(statusCodes).json({
      error: {
        status: "ERROR",
        code: statusCodes,
        message: error.message || "Internal Server Error",
      },
    });
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
