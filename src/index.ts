import dotenv from 'dotenv'; dotenv.config(); // load .env file
import { readdirSync, existsSync, readFileSync, statSync } from "fs";
import { pathToFileURL, fileURLToPath} from "url";
import { dirname, join } from "path";
import { Client, Collection, GatewayIntentBits, InteractionType } from 'discord.js';
import { Command, Interaction, Event } from './types.js';
import { refreshSlashCommands } from './registerSlashCommands.js';
import { hashCommands, loadModules } from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = process.env.DISCORD_TOKEN;

//Init client
const client = new Client({ intents: [
    //GatewayIntentBits.Guilds
]});

//Create map of commands from files and store to client
client.commands = new Collection()
const commands : object[] = []
const addCommand = async (commandFilePath : string) => {
    const command = await import(pathToFileURL(commandFilePath).href) as Command;
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON())
}
const commandFoldersPath = join(__dirname, "commands");
await loadModules(commandFoldersPath, addCommand)
//Register event files with client
const addEvent = async (eventFilePath : string) => {
    const event = await import(pathToFileURL(eventFilePath).href) as Event;
    if (event.once) {
        client.once(event.type, (...args) => event.execute(...args));
    } else {
        client.on(event.type, (...args) => event.execute(...args));
    }
}
const eventFoldersPath = join(__dirname, 'events');
await loadModules(eventFoldersPath, addEvent)

//Register non-command interactions (button pressed, modal submitted, etc.)
client.interactions = new Collection<InteractionType, Collection<string, Interaction>>([
    [InteractionType.MessageComponent, new Collection<string, Interaction>()],
    [InteractionType.ModalSubmit, new Collection<string, Interaction>()]
]);
const addInt = async (intFilePath : string) => {
    const interaction = await import(pathToFileURL(intFilePath).href) as Interaction;
    client.interactions.get(interaction.data.type)?.set(interaction.data.name, interaction)
}
const intFoldersPath = join(__dirname, 'interactions');
await loadModules(intFoldersPath, addInt);


//Make sure loaded commands matches commands registered with Discord
const savedHash = existsSync(join(__dirname, "commandRegister")) ? readFileSync(join(__dirname, "commandRegister"), "utf-8").trim() : "";
const currentHash = hashCommands(commands);
if (savedHash !== currentHash) {
    console.log("Registering commands with Discord...");
    await refreshSlashCommands();
}

client.login(TOKEN);
console.log("Client logging in...")