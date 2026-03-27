import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middlewares/errormiddleware";
import { DBconnection } from "./database/DBconnection";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transRoutes";
import dataRoutes from "./routes/dataRoutes";

dotenv.config();

const app = express();
// Allow requests from localhost and Vercel deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://personal-finance-management-rfaqvj1af.vercel.app'
];

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     next();
//   });
  
app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({extended:true}));



DBconnection();

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/data", dataRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
