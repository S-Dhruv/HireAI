import User from "../models/user.model.js";
export const getTests = async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tests = user.tests;
    res.status(200).json(tests);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRounds = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tests = user.tests;
    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: "No tests found for this user" });
    }
    const rounds = tests.flatMap((test) => test.rounds);
    if (!rounds || rounds.length === 0) {
      return res.status(404).json({ message: "No rounds found for this user" });
    }
    res.status(200).json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
