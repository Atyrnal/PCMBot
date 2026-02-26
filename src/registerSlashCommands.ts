import dotenv from 'dotenv'; dotenv.config();
import { REST, Routes } from 'discord.js';
import { readdirSync, writeFileSync, statSync, existsSync} from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { Command } from './types.js';
import { hashCommands, loadModules } from './utils.mjs';

export async function refreshSlashCommands() {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    console.error("Discord token is not defined in env");
    process.exit(1)
  }

  const clientId = Buffer.from(token.split('.')[0], 'base64').toString();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  //Create array of commands from files
  const commands : object[] = []
  const addCommand = async (commandFilePath : string) => {
      const command = await import(pathToFileURL(commandFilePath).href) as Command;
      commands.push(command.data.toJSON())
  }
  const commandFoldersPath = join(__dirname, "commands");
  await loadModules(commandFoldersPath, addCommand)

  const rest = new REST({ version: '10' }).setToken(token);

  //Register command list to Discord
  (async () => {
    try {
      console.log(`Started refreshing ${commands.length} application (/) commands.`);
      const data : any = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      if (process.env.DISCORD_DEV_GUILD) {
        try {
          rest.put(
            Routes.applicationGuildCommands(clientId, process.env.DISCORD_DEV_GUILD), // guild-specific
            { body: commands }
          );
        } catch (err) {
          console.log(err)
        }
      }

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
      writeFileSync(join(__dirname, "commandRegister"), hashCommands(commands));
    } catch (error) {
      console.error(error);
      //fs.writeFileSync(path.join(__dirname, "commandRegister.json"), JSON.stringify(commands.map(command => JSON.stringify(command)), null, 2));
    }
  })();
}