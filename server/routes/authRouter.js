import express from 'express';
import { registerUser, loginUser, logoutUser,sendVerifyOtp, verifyEmail,sendResetPassword,verifyResetPassword, getUserDetails } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';


const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/send-reset-password', userAuth, sendResetPassword);
authRouter.post('/verify-reset-password', userAuth, verifyResetPassword);
authRouter.post('/get-user-detail', userAuth, getUserDetails);
export default authRouter;