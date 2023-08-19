import express from "express";
import cors from "cors";
import DBConnection from "../database/db.js"
import userRouter from "../routes/userRoute.js"
const app = express();

// MiddleWares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/auth",userRouter);
// app.use("/problem-list", problemListRouter);
// app.use("/problem-statement", problemStatementRouter);
// app.use("/submissions", submissionRouter);

DBConnection();



app.listen("3001", () => console.log("server started!"));