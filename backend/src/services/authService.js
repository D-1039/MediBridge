const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");
const jwtConfig = require("../config/jwt");
const { ConflictError, UnauthorizedError } = require("../utils/errors");
const { USER_ROLES } = require("../constants");

const SALT_ROUNDS = 12;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: "refresh" },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

const authService = {
  async register({ fullName, full_name, email, password, role = USER_ROLES.DONOR }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError("Email already registered");

    // Public signup: only donor or receiver. Pharmacist/admin are assigned by staff/seed.
    const publicRoles = [USER_ROLES.DONOR, USER_ROLES.RECEIVER];
    const userRole = publicRoles.includes(role) ? role : USER_ROLES.DONOR;
    const name = (fullName || full_name || "").trim();
    if (!name) throw new ConflictError("Full name is required");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      fullName: name,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
    });

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async issueTokens(user) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessExpiresIn,
    };
  },

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const stored = await refreshTokenRepository.findByHash(hashToken(refreshToken));
    if (!stored) throw new UnauthorizedError("Refresh token revoked or expired");

    const user = await userRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedError("User not found");

    await refreshTokenRepository.deleteByHash(hashToken(refreshToken));
    return this.issueTokens(user);
  },

  async logout(refreshToken) {
    if (refreshToken) {
      await refreshTokenRepository.deleteByHash(hashToken(refreshToken));
    }
  },
};

module.exports = authService;
