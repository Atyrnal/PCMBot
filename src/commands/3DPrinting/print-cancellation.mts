import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { isEmployee } from '../../utils.mjs'
import { printers } from '../../config.js'

export const data = new SlashCommandBuilder()
    .setName("print-cancellation")
    .setDescription("Sends a print cancellation notification")
    .addStringOption((s) => 
        s.setName("printer")
        .setDescription("The printer (name) on which the print was canceled")
        .setChoices(printers)
        .setRequired(true)
    ).addStringOption((s) => 
        s.setName("reason")
        .setDescription("The reason why the print was canceled")
        .setRequired(true)
    ).addStringOption((s) => 
        s.setName("print-filename")
        .setDescription("The filename of the print that was canceled")
        .setRequired(false)
    ).addAttachmentOption((a) => 
        a.setName("image")
        .setDescription("A picture of the canceled print (for identification purposes)")
        .setRequired(false)
    )
    // .addSubcommand(() => new SlashCommandSubcommandBuilder()
    //     .setName("")
    // )

export async function execute(interaction : ChatInputCommandInteraction) {
    if (!isEmployee(interaction.member)) return interaction.reply({content:"This command is for Employees only.", flags: MessageFlags.Ephemeral});

    const pcEmbed = new EmbedBuilder()
        .setTitle("Print Canceled")
        .setColor("#ffbb00")
        .setTimestamp()
        .addFields(
            {name:"Printer", value:interaction.options.getString("printer",true)}
        )

    if (interaction.options.getString("print-filename", false) !== null) pcEmbed.addFields({ name: "Filename", value: interaction.options.getString("print-filename", false)!}) 
    pcEmbed.addFields({name:"Reason", value: interaction.options.getString("reason", true)});
    if (interaction.options.getAttachment("image", false) !== null) {
        const image = interaction.options.getAttachment("image", false)!
        if (image.contentType?.startsWith("image")) pcEmbed.setImage(image!.url)
    }

    const logChannelId = process.env.PRINT_LOG_CHANNEL_ID;
    let sent = false;
    if (logChannelId) {
        const channel = interaction.guild?.channels.cache.get(logChannelId);
        if (channel?.isTextBased()) {
            const permissions = channel.permissionsFor(interaction.guild!.members.me!);
            if (permissions?.has(PermissionFlagsBits.SendMessages) && permissions?.has(PermissionFlagsBits.EmbedLinks)) {
                channel.send({ embeds: [pcEmbed] });
                interaction.reply({ content: "Embed sent in <#" + process.env.PRINT_LOG_CHANNEL_ID + ">", embeds: [pcEmbed], flags: MessageFlags.Ephemeral})
                sent = true
            }
        }
    }
    if (!sent) {
        interaction.reply({ embeds: [pcEmbed] })
    }
}

