const Party = require("../models/partyModel");
const crypto = require("crypto");
const app = require("../index");
const wait = require("../utils/wait");
let nounList = require("../utils/nouns.json");

module.exports.createParty = async (req, res) => {
  const { name } = req.body;

  const code = crypto.randomBytes(3).toString("hex");

  const party = await Party.create({
    host: req.user._id,
    name,
    code,
    members: [{ user: req.user._id }],
  });

  res.status(200).json(code);
};

module.exports.getParty = async (req, res) => {
  const { code } = req.params;

  if (!code) throw new Error("Party code is required!");

  const party = await Party.findOne({ code }).populate("members.user");

  if (!party) throw new Error("Party doesn't exist!");
  
  if (!party.members?.some((member) => member.user._id.equals(req.user._id))) {
    party.members.push({ user: req.user._id });
    if (!party.turn) updateGame(party);
  }

  await party.save();

  res.status(200).json(party);
};

module.exports.getParties = async (req, res) => {
  const parties = await Party.find({}).populate("host", ["name"]);

  res.status(200).json(parties);
};

const updateGame = async (party) => {
  let turn = 0;
  let word = nounList[Math.floor(Math.random() * nounList.length)];
  let previousTurn = turn;

  if (party.members.length < 2) return;

  party.turn = party.members[0].user._id;
  party.word = word;
  app.io.to(party._id.toString()).emit("turn", turn, word);

  const start = async () => {
    while (true) {
      await wait(20000);
      const newParty = await Party.findById(party._id).select("members");

      if (!newParty || newParty.members.length < 2) {
        party.turn = null;
        party.word = null;
        app.io.to(party._id.toString()).emit("turn");
        await party.save();
        break;
      }

      while (previousTurn == turn) {
        turn = Math.floor(Math.random() * newParty.members.length);
      }
      app.io.to(party._id.toString()).emit("next", turn);
      await wait(2000);

      word = nounList[Math.floor(Math.random() * nounList.length)];
      party.word = word;

      if (newParty.members[turn]) {
        party.turn = newParty.members[turn].user;
      } else {
        party.turn = newParty.members[0].user;
        turn = 0;
      }
      previousTurn = turn;
      app.io.to(party._id.toString()).emit("turn", turn, word);
      await party.save();
    }
  };

  start();
};

module.exports.leaveParty = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400);

  const party = await Party.findById(id);

  if (!!party.members?.length) {
    party.members =
      party.members?.filter(
        (member) => member.user.toString() != req.user._id.toString()
      ) || [];
    await party.save();
  } else {
    await Party.deleteOne({ _id: id });
  }

  res.sendStatus(200);
};
