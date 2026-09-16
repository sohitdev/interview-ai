const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
    },
  },
  {
    timestamps: true,
  },
);

blacklistTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 3 * 24 * 60 * 60 },
);

const tokenBlacklistModel = mongoose.model("blacklist", blacklistTokenSchema);

module.exports = tokenBlacklistModel;
