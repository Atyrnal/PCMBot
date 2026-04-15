import dotenv from 'dotenv'; dotenv.config(); // load .env file
import { readdirSync, existsSync, readFileSync, statSync } from "fs";
import { readFile, writeFile } from 'fs/promises';
import { pathToFileURL, fileURLToPath} from "url";
import { dirname, join } from "path";
import { Client, Collection, GatewayIntentBits, InteractionType, Partials } from 'discord.js';
import { Command, Interaction, Event, CustomEvent, Service, Integration } from './types.js';
import { refreshSlashCommands } from './registerSlashCommands.js';
import { hashCommands, loadModules } from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = process.env.DISCORD_TOKEN;

//Init client
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions
], partials: [Partials.Message, Partials.Channel, Partials.Reaction]});

//Create non-persistent datastores
client.datastores = new Collection()
client.datastores.set("verificationCodes", new Collection<string, { email:string, code:string}>())

//Create map of commands from files and store to client
client.commands = new Collection()
const commands : object[] = []
const commandFoldersPath = join(__dirname, "commands");
await loadModules(commandFoldersPath, async (commandFilePath : string) => {
    const command = await import(pathToFileURL(commandFilePath).href) as Command;
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON())
})

//Register event files with client
const eventFoldersPath = join(__dirname, 'events');
await loadModules(eventFoldersPath, async (eventFilePath : string) => {
    const event = await import(pathToFileURL(eventFilePath).href) as Event;
    if (event.once) {
        client.once(event.type, (...args) => event.execute(...args));
    } else {
        client.on(event.type, (...args) => event.execute(...args));
    }
})

//Register non-command interactions (button pressed, modal submitted, etc.)
client.interactions = new Collection<InteractionType, Collection<string, Interaction>>([
    [InteractionType.MessageComponent, new Collection<string, Interaction>()],
    [InteractionType.ModalSubmit, new Collection<string, Interaction>()]
]);
const intFoldersPath = join(__dirname, 'interactions');
await loadModules(intFoldersPath, async (intFilePath : string) => {
    const interaction = await import(pathToFileURL(intFilePath).href) as Interaction;
    client.interactions.get(interaction.data.type)?.set(interaction.data.name, interaction)
});

//Register custom events (Events triggered by external code)

client.customEvents = new Collection<string, CustomEvent>();
const customFoldersPath = join(__dirname, "custom");
await loadModules(customFoldersPath, async (cstFilePath: string) => {
    const cstevent = await import(pathToFileURL(cstFilePath).href) as CustomEvent;
    client.customEvents.set(cstevent.data.name, cstevent);
})
client.triggerCustomEvent = async (eventName: string, ...args : any[]) => {
    let event;
    if (!client.customEvents.has(eventName) || (event = client.customEvents.get(eventName)) === undefined) return;
    event.execute(client, ...args);
}



//Make sure loaded commands matches commands registered with Discord
const savedHash = existsSync(join(__dirname, "commandRegister")) ? readFileSync(join(__dirname, "commandRegister"), "utf-8").trim() : "";
const currentHash = hashCommands(commands);
if (savedHash !== currentHash) {
    console.log("Registering commands with Discord...");
    await refreshSlashCommands();
}

//Load integrations
client.integrations = new Collection();
const ingFoldersPath = join(__dirname, "integrations")
await loadModules(ingFoldersPath, async (ingPath) => {
    const ing = await import(pathToFileURL(ingPath).href) as Integration;
    await ing.init();
    client.integrations.set(ing.data.name, ing.api);
})


client.login(TOKEN);
console.log("Client logging in...")

//Start services
const servicesFoldersPath = join(__dirname, "services")
await loadModules(servicesFoldersPath, async (servicePath) => {
    const service = await import(pathToFileURL(servicePath).href) as Service;
    service.start(client);
})