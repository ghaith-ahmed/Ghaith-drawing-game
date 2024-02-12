const mongoose = require("mongoose");

const partySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: "String",
      required: true,
      unique: true,
    },
    members: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          score: {
            type: Number,
            default: 0, // Assuming default score is 0
          },
        },
      ],
      default: [],
    },
    turn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    word: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Party", partySchema);
