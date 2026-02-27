import { ChatInputCommandInteraction, EmbedBuilder, GuildTextBasedChannel, MessageFlagsBitField, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js'
import { isEmployee } from '../../utils.mjs'
import { printers } from '../../config.js'

export const data = new SlashCommandBuilder()
    .setName("print-failure")
    .setDescription("Sends a print failure notification")
    .addStringOption((s) => 
        s.setName("printer")
        .setDescription("The printer (name) on which the failure occurred")
        .setChoices(printers)
        .setRequired(true)
    ).addStringOption((s) => 
        s.setName("print-filename")
        .setDescription("The filename of the print that failed")
        .setRequired(false)
    ).addAttachmentOption((a) => 
        a.setName("image")
        .setDescription("A picture of the failed print (for identification purposes)")
        .setRequired(false)
    ).addStringOption((s) => 
        s.setName("notes")
        .setDescription("Notes pertaining to the failure (reason for failure, was it restarted, etc.)")
        .setRequired(false)
    )
    // .addSubcommand(() => new SlashCommandSubcommandBuilder()
    //     .setName("")
    // )

export async function execute(interaction : ChatInputCommandInteraction) {
    if (!isEmployee(interaction.member)) return interaction.reply({content:"This command is for Employees only.", flags: MessageFlagsBitField.Flags.Ephemeral});

    const pfEmbed = new EmbedBuilder()
        .setTitle("Print Failure")
        .setColor("#ff1144")
        .setTimestamp()
        .addFields(
            {name:"Printer", value:interaction.options.getString("printer",true)}
        )

    if (interaction.options.getString("print-filename", false) !== null) pfEmbed.addFields({ name: "Filename", value: interaction.options.getString("print-filename", false)!}) 
    if (interaction.options.getString("notes", false) !== null) pfEmbed.addFields({ name: "Notes", value: interaction.options.getString("notes", false)!}) 
    if (interaction.options.getAttachment("image", false) !== null) {
        const image = interaction.options.getAttachment("image", false)!
        if (image.contentType?.startsWith("image")) pfEmbed.setImage(image!.url)
    }

    const logChannelId = process.env.PRINT_LOG_CHANNEL_ID;
    let sent = false;
    if (logChannelId) {
        const channel = interaction.guild?.channels.cache.get(logChannelId);
        if (channel?.isTextBased()) {
            const permissions = channel.permissionsFor(interaction.guild!.members.me!);
            if (permissions?.has(PermissionFlagsBits.SendMessages) && permissions?.has(PermissionFlagsBits.EmbedLinks)) {
                channel.send({ embeds: [pfEmbed] });
                sent = true
            }
        }
    }
    if (!sent) {
        interaction.reply({ embeds: [pfEmbed] })
    }
}

