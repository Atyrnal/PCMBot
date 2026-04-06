import { ActivityType, Client } from 'discord.js';

export const data = { name: "staffingUpdate" };
export async function execute(client: Client, staffed : boolean) : Promise<void> {
    if (client === undefined) return console.log("Error: client is not defined");
    if (client.user === null) return console.log("Error: client.user is null");
    if (staffed) {
        client.user.setPresence({
            status: 'online'
        });
        client.user.setActivity({
            name: (() => {
                const randInt = (min:number, max:number) => (Math.floor(Math.random() * (max - min)) + min)
                const choices = ["Calibrating ciruits...", "Heating nozzles...", "Priming lasers...", "Monitoring radiowaves...", "Compiling libraries...", "Constructing devices..."]
                return choices[randInt(0, choices.length)]
            })(),
            type: ActivityType.Streaming
        });
    } else {
        client.user.setPresence({
            status: 'dnd'
        })
        client.user.setActivity({
            name: "Makerspace is closed...",
            type: ActivityType.Streaming
        })
    }
}