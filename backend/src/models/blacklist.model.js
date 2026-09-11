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

const tokenBlacklistModel = mongoose.model("blacklist", blacklistTokenSchema);

module.exports = tokenBlacklistModel;
