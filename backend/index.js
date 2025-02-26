require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");
const OTP = require("./models/otp.model");

const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const express = require("express");
const cors = require("cors");
const app = express();


const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const checkPasswordRequirements = (password) => {
  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password) &&
    password.length >= 8
  );
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateName = (name) => {
  const regex = /^[a-zA-Z.\s]+$/;
  return regex.test(name);
}

const validateUserName = (userName) => {
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(userName);
};

const evaluateExpressions = (content) => {
  const regex = /([0-9+\-*/^%() x]+)\s*=/g;
  return content.replace(regex, (match, expression) => {
    try {
      const sanitizedExpression = expression
        .replace(/\s+/g, '')
        .replace(/x/g, '*')
        .replace(/\^/g, '**')
      if (!/[+\-*\/%**]/.test(sanitizedExpression)) {
        return match;
      }
      const result = eval(sanitizedExpression);
      return `${match}${result}`;
    } catch (error) {
      return match;
    }
  });
};

const checkMoodByKeywords = (content, keywords) => {
  return keywords.some((keyword) => content.includes(keyword));
};

const determineMoodFromSentiment = (score, content) => {
  const lowerContent = content.toLowerCase();

  const moodKeywords = {
    romantic: [
      "love",
      "romantic",
      "affection",
      "sweetheart",
      "sweet",
      "lovely",
      "adore",
      "dear",
    ],
    happy: [
      "joy",
      "delighted",
      "blissful",
      "cheerful",
      "content",
      "grateful",
      "blessed",
      "smiling",
      "overjoyed",
      "positive",
      "promotion",
    ],
    excited: [
      "thrilled",
      "pumped",
      "hyped",
      "eager",
      "exciting",
      "adventure",
      "energetic",
      "can't wait",
      "excited",
    ],
    sad: [
      "upset",
      "down",
      "heartbroken",
      "lonely",
      "depressed",
      "gloomy",
      "unhappy",
      "disappointed",
      "negative",
    ],
    angry: [
      "furious",
      "irritated",
      "annoyed",
      "outraged",
      "mad",
      "pissed",
      "infuriated",
    ],
    relaxed: [
      "calm",
      "peaceful",
      "serene",
      "chill",
      "unwinding",
      "carefree",
      "laid back",
      "tranquil",
    ],
  };

  if (checkMoodByKeywords(lowerContent, moodKeywords.romantic)) {
    return "Romantic";
  }

  if (checkMoodByKeywords(lowerContent, moodKeywords.happy)) {
    return "Happy";
  }

  if (checkMoodByKeywords(lowerContent, moodKeywords.excited)) {
    return "Excited";
  }

  if (checkMoodByKeywords(lowerContent, moodKeywords.relaxed)) {
    return "Relaxed";
  }

  if (checkMoodByKeywords(lowerContent, moodKeywords.sad)) {
    return "Sad";
  }

  if (checkMoodByKeywords(lowerContent, moodKeywords.angry)) {
    return "Angry";
  }

  if (score >= 3) return "Happy";
  if (score >= 2) return "Excited";
  if (score === 0) return "Relaxed";
  if (score <= 0 && score >= -2) return "Sad";
  if (score <= -2) return "Angry";

  return "Neutral";
};

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Node is running" });
});

// Request OTP
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  const otp = generateOTP();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60000);
  const cooldownUntil = new Date(now.getTime() + 5 * 60000);

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ error: true, message: "Email not registered" });
  }

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt, cooldownUntil, isVerified: false },
    { upsert: true, new: true }
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",
    text: `OTP for Notelynx is ${otp} (valid for 5 mins).`,
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.error("Error sending OTP email: ", error);
      return res
        .status(500)
        .json({ error: true, message: "Failed to send OTP" });
    } else {
      res.json({ error: false, message: "OTP sent to email" });
    }
  });
});

// Resend OTP
app.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ error: true, message: "Email not registered" });
  }

  const otpEntry = await OTP.findOne({ email });
  if (!otpEntry) {
    return res
      .status(404)
      .json({ error: true, message: "OTP request not found" });
  }

  const now = new Date();

  if (otpEntry.cooldownUntil && otpEntry.cooldownUntil > now) {
    const cooldownTimeLeft = Math.round((otpEntry.cooldownUntil - now) / 60000);
    return res.status(429).json({
      error: true,
      message: `Please wait ${cooldownTimeLeft} more minute(s) before requesting a new OTP`,
    });
  }

  const newOtp = generateOTP();
  const expiresAt = new Date(now.getTime() + 5 * 60000);
  const cooldownUntil = new Date(now.getTime() + 5 * 60000);

  otpEntry.otp = newOtp;
  otpEntry.expiresAt = expiresAt;
  otpEntry.cooldownUntil = cooldownUntil;
  otpEntry.isVerified = false;
  await otpEntry.save();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Resend OTP Verification",
    text: `Your new OTP for Notelynx is ${newOtp} (valid for 5 mins).`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return res
        .status(500)
        .json({ error: true, message: "Failed to send OTP" });
    }
    res.json({ error: false, message: "New OTP sent to email" });
  });
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: true, message: "OTP is required" });
  }

  const otpEntry = await OTP.findOne({ otp });

  if (!otpEntry) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (otpEntry.expiresAt < new Date()) {
    return res.status(400).json({ error: true, message: "OTP Expired" });
  }

  otpEntry.isVerified = true;
  await otpEntry.save();

  const user = await User.findOne({ email: otpEntry.email });

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  res.json({ error: false, message: "OTP verified", accessToken });
});

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  if (!userName) {
    return res
      .status(400)
      .json({ error: true, message: "Username is required" });
  }

  if (!checkPasswordRequirements(password)) {
    return res.status(400).json({
      error: true,
      message: "Password does not meet the required criteria",
    });
  }

  if (!validateUserName(userName)) {
    return res.status(400).json({
      error: true,
      message: "Please enter a valid username",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      error: true,
      message: "Please enter a valid email id",
    });
  }

  if (!validateName(fullName)) {
    return res.status(400).json({
      error: true,
      message: "Please enter a valid name",
    });
  }

  const isUser = await User.findOne({ $or: [{ email }, { userName }] });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (isUser) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }

  const user = new User({
    fullName,
    userName,
    email,
    password: hashedPassword,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const isUser = await User.findById(user._id);

    return res.json({
      user: {
        fullName: isUser.fullName,
        userName: isUser.userName,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn,
      },
      message: "User found",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error while fetching user information",
    });
  }
});

//Login
app.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  if (!userName) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const userInfo = await User.findOne({ userName: userName });

  if (!userInfo) {
    return res.status(400).json({ message: "Incorrect username or password" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const match = await bcrypt.compare(password, userInfo.password);

  if (userInfo.userName == userName && match) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      userName,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Incorrect username or password",
    });
  }
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const existingNote = await Note.findOne({ title: title, userId: user._id });

    const evaluatedContent = evaluateExpressions(content);
    const sentimentResult = sentiment.analyze(content);
    const mood = determineMoodFromSentiment(sentimentResult.score, content);

    if (existingNote) {
      return res.status(400).json({
        error: true,
        message: "Note already exist, try to create a new note",
      });
    }

    const note = new Note({
      title,
      content: evaluatedContent,
      tags: tags || [],
      userId: user._id,
      mood: mood,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Error while adding note",
    });
  }
});

// Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title || !content) {
    return res.status(400).json({
      error: true,
      message: "Please enter required fields to update note",
    });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    const isTitleSame = typeof title === "undefined" || title === note.title;
    const isContentSame =
      typeof content === "undefined" || content === note.content;
    const isTagsSame =
      typeof tags === "undefined" ||
      JSON.stringify(tags) === JSON.stringify(note.tags);

    if (isTitleSame && isContentSame && isTagsSame) {
      return res.status(400).json({
        error: true,
        message: "Please update at least one field",
      });
    }

    let mood = note.mood;
    let evaluatedContent = content;

    if (content !== note.content) {
      evaluatedContent = evaluateExpressions(content);
      const sentimentResult = sentiment.analyze(content);
      mood = determineMoodFromSentiment(sentimentResult.score, content);
    }

    if (title && title !== note.title) {
      const existingNote = await Note.findOne({
        title: title,
        userId: user._id,
        _id: { $ne: noteId },
      });

      if (existingNote) {
        return res.status(400).json({
          error: true,
          message:
            "A note with the same title already exists. Please choose a different title.",
        });
      }

      note.title = title;
    }

    if (!isContentSame) note.content = evaluatedContent;
    if (!isTagsSame) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;
    if (mood) note.mood = mood;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Error cannot update note try later",
    });
  }
});

// Get All Notess
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error while fetching notes",
    });
  }
});

// Get Notes Count
app.get("/get-notes-count", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const count = await Note.countDocuments({ userId: user._id });

    return res.json({
      error: false,
      count,
      message: "Notes count retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error while fetching notes count",
    });
  }
});

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "No note found to delete",
      });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error while deleting note",
    });
  }
});

// Update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    note.isPinned = !note.isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error cannot update note try later",
    });
  }
});

// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

const run = app.listen(8004);

const port = process.env.PORT || run;

module.exports = app;
