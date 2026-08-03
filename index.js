import dotenv from "dotenv"
dotenv.config();

import express from "express"
import multer from "multer"
import {router as authRouter} from "./src/routers/authRouter.js"
import {router as stripeRouter} from "./src/routers/stripeRouter.js"
import {router as planRouter} from "./src/routers/planRouter.js"
import {router as couponRouter} from "./src/routers/couponRouter.js"

const app = express();
const upload = multer();

app.disable('x-powered-by');
app.use(upload.none());
app.use("/api/auth", authRouter)
app.use("/api/stripe", stripeRouter)
app.use("/api/plan", planRouter)
app.use("/api/coupon", couponRouter)
app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})