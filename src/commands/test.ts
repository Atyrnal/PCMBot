import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test the bot's ability to respond to commands")

export async function execute(interaction : ChatInputCommandInteraction) {
    interaction.reply("Hello World!");
}