deeBOT

A simple trivia bot for Hack Club Slack.

deeBOT lets people play multiple-choice trivia directly in Slack, keep track of their scores, and compete on a leaderboard.

Features
Random trivia questions
Multiple-choice answers
Persistent user scores
Answer accuracy tracking
Leaderboard
Simple Slack slash commands
Commands
/dee-help
/dee-trivia
/dee-answer A
/dee-score
/dee-leaderboard
Tech stack
JavaScript
Node.js
Slack Bolt
Axios
Open Trivia DB
JSON for local data storage
How it works
Slack
  ↓
deeBOT
  ↓
Open Trivia DB
  ↓
Question
  ↓
Slack

Scores and statistics are stored locally in scores.json and stats.json.

Setup

Clone the repository:

git clone https://github.com/deepakverma-afk/dee-bot.git
cd dee-bot

Install dependencies:

npm install

Create a .env file:

SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token

Start the bot:

node index.js
Slack setup

deeBOT uses Slack Socket Mode, so it does not need a public web server to receive slash commands.

The Slack app needs the appropriate permissions for slash commands and messaging.

Data

User scores are stored in:

scores.json
stats.json

These files are simple JSON files so the bot can remember scores after restarting.

Future plans
Trivia categories
Difficulty levels
Daily trivia
Streaks
More game modes
License

This project is made for Hack Club Stardance.
