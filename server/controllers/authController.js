import bcrypt from 'bcryptjs';



// server/controllers/authController.js // Import the user model
import jwt from 'jsonwebtoken';
import userModel from '../model/userModel.js';
import transporter from '../config/nodemailer.js';

// Register Function
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Please fill all fields' });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
// welcome email
   // Send welcome email
        const mailOption = {
          from: process.env.SENDER_EMAIL, // your email from .env
          to: email, // send to the registered user's email
          subject: 'Welcome to our website',
          text: `Hi ${name}, welcome to our website!`,
          html: `<p>Hi <b>${name}</b>, welcome to our website!</p>`,
        };
        
    
        try {
  const info = await transporter.sendMail(mailOption); // info में भेजे गए mail की details मिलेंगी

  console.log("Recipient Email:", email);
  console.log("Sender Email:", process.env.SENDER_EMAIL);
  console.log("Email sent successfully ✅");
  console.log("Message ID:", info.messageId);  // यहां से सही ID मिलेगी
} catch (error) {
  console.error("Error sending email ❌:", error);
}

    

    
    return res.json({ success: true, message: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email }});
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Login Function
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Please fill all fields' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    

    return res.json({ success: true, message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Logout Function
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// send otp for resetPassword Function
export const sendResetPassword = async (req, res) => {
  ///


  const {email, resetOtp} = req.body;
  if (!email) {
    return res.json({ success: false, message: 'enteraxs' });
    
  }

  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.json({ success: false, message: 'user not found' });
      
    }
       const resetOtp = String(Math.floor(100000 + Math.random() *900000) );
   
  
    user.resetOtp = resetOtp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;
    
    await user.save();
    res.json({ success: true, message: 'reset otp sent' });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${resetOtp}`,
      html: `<p>Your OTP for password reset is <b>${resetOtp}</b></p>`,
    };

    try {
      const info = await transporter.sendMail(mailOption);
      console.log("Email sent successfully ✅");
      console.log("Message ID:", info.messageId);
    } catch (error) {
      console.error("Error sending email ❌:", error);
    }

  } catch (error) {
   return res.json({success : false, message : error.message});
  }}
/// verify reset password
export const verifyResetPassword = async (req, res) => {
  const { email, newPassword, resetOtp } = req.body;
  if (!email || !newPassword ) {
    return res.json({ success: false, message: 'Please fill all fields' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.resetOtp === '' || user.resetOtp !== resetOtp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }
    if (newPassword.length < 6) {
      return res.json({ success: false, message: 'Password must be at least 6 characters long' });
    }
    const userName = user.name;
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpiresAt = '';

    await user.save();
    const mailOption = {
          from: process.env.SENDER_EMAIL, // your email from .env
          to: email, // send to the registered user's email
          subject: 'Reset Password Successful',
          text: `Hi ${userName}, welcome to our website!`,
          html: `<p>Hi <b>${userName}</b>, your password has been reset successfully!</p>`,
        };
        
    
        try {
  const info = await transporter.sendMail(mailOption); // info में भेजे गए mail की details मिलेंगी

  console.log("Recipient Email:", email);
  console.log("Sender Email:", process.env.SENDER_EMAIL);
  console.log("Email sent successfully ✅");
  console.log("Message ID:", info.messageId);  // यहां से सही ID मिलेगी
} catch (error) {
  console.error("Error sending email ❌:", error);
}

    return res.json({ success: true, message: 'Password reset successful' });

   
    



    
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// send verify otp
export const sendVerifyOtp = async (req,res) =>{

  try {
    const {email} = req.body;

    const user = await userModel.findOne({email});
    if (user.isAccountVerified) {
      return res.json({success: false , message : "Account is already verified"})
      
    }

   const otp = String(Math.floor(100000 + Math.random() *900000) );
    user.verifyOtp = otp;
    user.verifyOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    await user.save();


    const mailOption = {
          from: process.env.SENDER_EMAIL, // your email from .env
          to: email, // send to the registered user's email
          subject: 'Account verification OTP',
          text: `Hi  your otp is ${otp}, welcome to our website!`,
          html: `<p>Hi <b></b>,${otp} welcome to our website!</p>`,
        };
              try {
  const info = await transporter.sendMail(mailOption); // info में भेजे गए mail की details मिलेंगी

  
  console.log("Message ID:", info.messageId);  // यहां से सही ID मिलेगी
} catch (error) {
  console.error("Error sending email ❌:", error);
}



  } catch (error) {
    res.json({success : false, message : error.message});
    
  }


}

/// verify email
export const verifyEmail = async (req, res) => {
  const {userId, otp} = req.body;
  if (!userId|| !otp) {
    return res.json({ success: false, message: 'missing detail' });
    
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'user not found' });
      
    }
    if (user.verifyOtp===  ''||user.verifyOtp !== otp  ) {
      return res.json({ success: false, message: 'invalid otp' });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.json({success: false, message: 'otp expired'})
      
    }
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpiresAt = '';
    await user.save();
    res.json({ success: true, message: 'email verified' });


  } catch (error) {
   return res.json({success : false, message : error.message});
  }}


  // get user details
export const getUserDetails = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }}            