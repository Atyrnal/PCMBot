import { BaseInteraction, ChatInputCommandInteraction, Client, ClientEvents, InteractionType, SlashCommandBuilder } from 'discord.js'

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction : ChatInputCommandInteraction) => Promise<void>;
}

export interface Event {
    type : keyof ClientEvents;
    execute: (...args: any[]) => Promise<void>;
    once : boolean;
}

export interface Interaction {
    data: { name: string, type: InteractionType};
    execute: (interaction : BaseInteraction) => Promise<void>;
}

export interface CustomEvent {
    data: { name:string };
    execute: (client: Client, ...args: any[]) => Promise<void>
}

export interface Service {
    data: { name:string };
    start: ( client : Client) => Promise<void>
}

export interface Integration {
    data: {name: string};
    init: () => Promise<void>;
    api: any;
}

export enum CustomEventType {
    staffingUpdate = "staffingUpdate"
}