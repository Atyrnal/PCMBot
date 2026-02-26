export {};

declare module 'discord.js' {
    interface Client {
        commands: import('discord.js').Collection<string, import('./types.ts').Command>;
        interactions: import('discord.js').Collection<import('discord.js').InteractionType, import('discord.js').Collection<string, import('./types.ts').Interaction>>;
    }
}