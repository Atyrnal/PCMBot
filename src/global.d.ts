export {};

declare module 'discord.js' {
    interface Client {
        commands: import('discord.js').Collection<string, import('./types.ts').Command>;
        interactions: import('discord.js').Collection<import('discord.js').InteractionType, import('discord.js').Collection<string, import('./types.ts').Interaction>>;
        customEvents: import('discord.js').Collection<string, import('./types.ts').CustomEvent>;
        integrations: import('discord.js').Collection<string, any>;
        datastores: import('discord.js').Collection<string, import('discord.js').Collection<any, any>>
        triggerCustomEvent(eventName : string, ...args : any[]) : Promise<void>;
    }
}