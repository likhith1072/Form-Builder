import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import formRoutes from './routes/form.route.js';
// import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

mongoose.connect(process.env.MONGO).then(()=>{console.log('Connected to mongoDB');}).catch((err)=>{console.log(err);}); 

const __dirname = path.resolve();
const app=express();
const origin = process.env.NODE_ENV === 'production'
  ? 'https://blogging-platform-with-dashboard.onrender.com'
  : 'http://localhost:5173';

app.use(cors({
    origin:origin,
    credentials: true,
     // If you plan to send cookies/auth headers
  }));



app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});


app.use('/api/form',formRoutes);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('/*splat', (req, res) => { 
  res.sendFile(path.join(__dirname, 'client','dist','index.html'));
});

app.use((err,req,res,next)=>{
    const statusCode=err.statusCode || 500;
    const message =err.message || "internal Server Error";
    res.status(statusCode).json({
        success:false,
        statusCode,
        message,
    });
});
