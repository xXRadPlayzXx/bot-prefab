# Discord.js Bot Prefab

**DISCLAIMER: If you are new to Discord.js and TypeScript in general, then don't even bother trying to understand how this prefab works. You should have at least decent knowledge about how Discord bots work and know some basic JS. If you have any question or spot any mistakes, shoot me a DM on Discord (_</RadPlayz>#2777_) or join my [server](https://discord.gg/rm6GP9wypc).**\
**_Don't DM me asking how to do this and that command, I will only help you with using the bot prefab, not with specific commands._**

## What is this?

This is a feature-rich bot prefab to make creating bots a bit easier, it has a fairly simple command and event handler and plenty of commands ([`src/commands`](src/commands)). I made this because I don't think writing the whole handler yourself is neccesary to make a Discord bot, although you should at least try to understand how it all works to make it easier to debug.

## Setup

### 1. Clone this repository

```bash
git clone https://github.com/xXRadPlayzXx/bot-prefab
```

### 2. Setting up node packages

Run the following command in your CLI: 
```bash
npm install
```

### 3. Setup environment variables

Rename .env.example to .env and replace the place holders to their actual value 

### 4. Starting your bot

After you filled in the environment variables, You can start your bot using this command:
```bash
npm run dev
```

## Up coming features

- Full economy commands
- Per server prefixes
- Per server command disabling/enabling and customizable per server command permissions
- Per server custom command aliases
- Per server custom command cooldowns for certain roles
- Global blacklisting/whitelisting of users
- Pagination function and more quality of life features

## Credits

Credits to canta for this README.md i just stole it.\
canta's discord: canta#5556\
canta's github: https://github.com/canta-slaus\
canta's server: https://discord.gg/j6SPS8227S
