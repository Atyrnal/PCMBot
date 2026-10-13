import { Client, Events, MessageReaction, MessageReactionEventDetails, User } from 'discord.js';


export const type = Events.MessageReactionRemove;
export function execute(messageReaction: MessageReaction, user: User, details: MessageReactionEventDetails) {
    //if (messageReaction.message.id)
}