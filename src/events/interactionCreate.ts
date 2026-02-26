import { BaseInteraction, Events, InteractionType } from 'discord.js';

export const type = Events.InteractionCreate;
export async function execute(interaction : BaseInteraction) {
    if (interaction.isChatInputCommand()) { //if interaction is slash command
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction); //Execute command from collection
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        const action = interaction.client.interactions.get(interaction.type)!.get(interaction.customId)
        if (!action) {
            console.error(`No interaction matching ${interaction.customId} was found.`);
            return;
        }
        try {
            await action.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while processing this interaction!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while processing this interaction!', ephemeral: true });
            }
        }
    }
}