//Built by dee :)
require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");
const fs = require("fs");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const activeQuestions = {};

let scores = {};
if (fs.existsSync("./scores.json")) {
  scores = JSON.parse(fs.readFileSync("./scores.json", "utf8"));
}

function saveScores() {
  fs.writeFileSync("./scores.json", JSON.stringify(scores, null, 2));
}

let stats = {};
if (fs.existsSync("./stats.json")) {
  stats = JSON.parse(fs.readFileSync("./stats.json", "utf8"));
}

function saveStats() {
  fs.writeFileSync("./stats.json", JSON.stringify(stats, null, 2));
}

app.command("/dee-help", async ({ ack, respond }) => {
  await ack();

  await respond({
    text:
`*deeBOT*

/dee-trivia — Get a trivia question
/dee-answer A — Answer the current question
/dee-score — View your stats
/dee-leaderboard — View the leaderboard`
  });
});

app.command("/dee-trivia", async ({ ack, respond, command }) => {
  await ack();

  const channelId = command.channel_id;

  if (activeQuestions[channelId]) {
    await respond({
      text: "There is already a question active. Answer it before starting another one."
    });
    return;
  }

  try {
    const response = await axios.get(
      "https://opentdb.com/api.php?amount=1&type=multiple"
    );

    if (!response.data.results || response.data.results.length === 0) {
      await respond({
        text: "The trivia API didn't return a question. Try again."
      });
      return;
    }

    const question = response.data.results[0];

    const decode = (text) =>
      text
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

    const correct = decode(question.correct_answer);
    const incorrect = question.incorrect_answers.map(decode);

    const choices = [...incorrect, correct].sort(
      () => Math.random() - 0.5
    );

    const letters = ["A", "B", "C", "D"];

    activeQuestions[channelId] = {
      correct,
      choices
    };

    let message = `*TRIVIA TIME*\n\n`;
    message += `*${decode(question.question)}*\n\n`;

    choices.forEach((choice, index) => {
      message += `${letters[index]}) ${choice}\n`;
    });

    message += `\nReply with \`/dee-answer A\` (or B/C/D).`;

    await respond({
      text: message
    });
  } catch (error) {
    console.error("Trivia API error:", error);

    await respond({
      text: "Couldn't fetch a trivia question right now."
    });
  }
});

app.command("/dee-answer", async ({ ack, respond, command }) => {
  await ack();

  const channelId = command.channel_id;
  const userId = command.user_id;
  const question = activeQuestions[channelId];

  if (!question) {
    await respond({
      text: "There isn't an active question. Try `/dee-trivia`."
    });
    return;
  }

  const answer = command.text.trim().toUpperCase();
  const letters = ["A", "B", "C", "D"];
  const index = letters.indexOf(answer);

  if (index === -1) {
    await respond({
      text: "Use A, B, C, or D."
    });
    return;
  }

  if (!scores[userId]) {
    scores[userId] = 0;
  }

  if (!stats[userId]) {
    stats[userId] = {
      correct: 0,
      answered: 0
    };
  }

  stats[userId].answered++;

  const selected = question.choices[index];

  if (selected === question.correct) {
    scores[userId]++;
    stats[userId].correct++;

    saveScores();
    saveStats();

    const accuracy = Math.round(
      (stats[userId].correct / stats[userId].answered) * 100
    );

    await respond({
      text:
`*Correct!*

The answer was *${question.correct}*.

<@${userId}> gets +1 point
Score: ${scores[userId]}
Accuracy: ${accuracy}%`
    });

    delete activeQuestions[channelId];
  } else {
    saveStats();

    const accuracy = Math.round(
      (stats[userId].correct / stats[userId].answered) * 100
    );

    await respond({
      text:
`*Not quite.*

That's not the right answer. Try again.

Score: ${scores[userId]}
Accuracy: ${accuracy}%`
    });
  }
});

app.command("/dee-score", async ({ ack, respond, command }) => {
  await ack();

  const userId = command.user_id;
  const score = scores[userId] || 0;

  const userStats = stats[userId] || {
    correct: 0,
    answered: 0
  };

  const accuracy =
    userStats.answered === 0
      ? 0
      : Math.round(
          (userStats.correct / userStats.answered) * 100
        );

  await respond({
    text:
`*DEE-BOT STATS*

<@${userId}>

Points: ${score}
Correct: ${userStats.correct}
Answered: ${userStats.answered}
Accuracy: ${accuracy}%`
  });
});

app.command("/dee-leaderboard", async ({ ack, respond }) => {
  await ack();

  const leaderboard = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (leaderboard.length === 0) {
    await respond({
      text: "Nobody has scored yet. Start with `/dee-trivia`."
    });
    return;
  }

  let message = "*DEE-BOT LEADERBOARD*\n\n";

  leaderboard.forEach(([userId, score], index) => {
    message += `${index + 1}. <@${userId}> — ${score} points\n`;
  });

  await respond({
    text: message
  });
});

(async () => {
  try {
    await app.start();
    console.log("deeBOT is online.");
  } catch (error) {
    console.error("Failed to start deeBOT:", error);
  }
})();
