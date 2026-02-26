import dotenv from 'dotenv'; dotenv.config();
import { REST, Routes } from 'discord.js';
import { readdirSync, writeFileSync, statSync} from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { Command } from './types.js';
import { hashCommands } from './utils.js';

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
  const commandFolders = readdirSync(commandFoldersPath);
  for (const folder of commandFolders) {
      const commandsPath = join(commandFoldersPath, folder);
      if (statSync(commandsPath).isDirectory()) {
          const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
          for (const file of commandFiles) {
              const filePath = join(commandsPath, file);
              await addCommand(filePath)
          }
      } else if (commandsPath.endsWith('.ts')) {
          await addCommand(commandsPath)
      }
  }

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