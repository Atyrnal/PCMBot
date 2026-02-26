import { Client, Events } from 'discord.js';


export const type = Events.ClientReady;
export const once = true;
export function execute(client : Client) {
    if (!client.user) throw new Error('Client user is null');
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
        status: 'online'
    });
    client.user.setActivity({
        name: (() => {
            const randInt = (min:number, max:number) => (Math.floor(Math.random() * (max - min)) + min)
            const choices = ["Calibrating ciruits...", "Heating nozzles...", "Priming laser...", "Monitoring radiowaves...", "Compiling libraries...", "Constructing devices..."]
            return choices[randInt(0, choices.length)]
        })(),
        type: 1
    });
}