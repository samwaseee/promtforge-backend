import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

// --- HELPER: Secure Role Assigner ---
// This prevents hackers from sending {"role": "ADMIN"} in the request body.
const getSafeRole = (requestedRole) => {
  if (requestedRole === 'SELLER') return Role.SELLER;
  return Role.BUYER; // Defaults everything else to BUYER
};

// --- REGISTER A NEW USER ---
export const register = async (req, res) => {
  try {
    // ✨ FIX 1: Extract role from req.body again
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // ✨ FIX 2: Apply the Bouncer logic
        role: getSafeRole(role), 
      },
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// --- LOGIN EXISTING USER ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// --- SYNC FIREBASE USER TO POSTGRESQL ---
export const syncUser = async (req, res) => {
  try {
    const tokenName = req.user?.name || req.user?.displayName;
    const uid = req.user?.uid || req.user?.user_id; 
    
    // ✨ THE FIX: Add a fallback for GitHub/Twitter users with hidden emails
    const email = req.user?.email || `${uid}@hidden.oauth.user`;
    
    const picture = req.user?.picture || req.user?.avatar;

    const bodyName = req.body?.name || req.body?.displayName;
    const { avatar, role } = req.body; 

    const finalName = bodyName || tokenName || 'New User';
    const safeRole = role ? getSafeRole(role) : undefined;

    const user = await prisma.user.upsert({
      where: { email: email }, // Prisma will no longer crash here!
      update: { 
        name: finalName, 
        avatar: avatar || picture || undefined,
        role: safeRole || undefined, 
      },
      create: {
        id: uid, 
        email: email, // Saves the real email, or the safe placeholder
        name: finalName, 
        avatar: avatar || picture || null,
        password: "FIREBASE_AUTH_USER", 
        role: safeRole || Role.BUYER, 
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });

  } catch (error) {
    // ✨ Pro-tip: Look at your backend terminal when a 500 happens. 
    // This console.log will tell you exactly what line caused the crash!
    console.error("Sync Error:", error);
    res.status(500).json({ error: "Failed to sync user with database" });
  }
};

