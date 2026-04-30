import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    // 1. Grab the token from the request headers
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ error: "Access Denied. No token provided." });
    }

    // 2. Strip the "Bearer " prefix if it exists
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    // 3. Verify the token against your secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the decoded user data (id, role) to the request
    req.user = verified;
    
    // 5. Move to the next function
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// --- ADMIN AUTHORIZATION MIDDLEWARE ---
export const isAdmin = (req, res, next) => {
  // Your verifyToken middleware should have already attached the decoded token to req.user
  if (req.user && req.user.role === 'ADMIN') {
    next(); // They are an admin, proceed to the controller!
  } else {
    res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};