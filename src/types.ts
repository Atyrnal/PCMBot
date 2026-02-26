import { BaseInteraction, ChatInputCommandInteraction, ClientEvents, InteractionType, SlashCommandBuilder } from 'discord.js'

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