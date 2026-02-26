import { ChatInputCommandInteraction, EmbedBuilder, GuildTextBasedChannel, MessageFlagsBitField, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js'
import { isEmployee } from '../../utils.js'

export const data = new SlashCommandBuilder()
    .setName("print-cancellation")
    .setDescription("Sends a print cancellation notification")
    .addStringOption((s) => 
        s.setName("printer")
        .setDescription("The printer (name) on which the print was canceled")
        .setChoices(
            { name: "Qiao Chi Ji", value: "Qiao Chi Ji (P1S)" },
            { name: "Yang Yang", value: "Yang Yang (P1S)" },
            { name: "Kai Kai", value: "Kai Kai (P1S)" },
            { name: "Xing Xing", value: "Xing Xing (X1C)" },
            { name: "Po", value: "Po (H2D)" },
            { name: "Lin Lin", value: "Lin Lin (X1C)" },
            { name: "CORE One", value: "CORE One"},
            { name: "MK4 Left", value: "MK4 Left"},
            { name: "MK4 Center", value: "MK4 Center"},
            { name: "MK4 Right", value: "MK4 Right"},
            { name: "MK3S Middle Left", value: "MK3S Middle Left"},
            { name: "MK3S Middle Right", value: "MK3S Middle Right"},
            { name: "MK3S Bottom Left", value: "MK3S Bottom Left"},
            { name: "MK3S Bottom Center", value: "MK3S Bottom Center"},
            { name: "MK3S Bottom Right", value: "MK3S Bottom Right"}
        )
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
    if (!isEmployee(interaction.member)) return interaction.reply({content:"This command is for Employees only.", flags: MessageFlagsBitField.Flags.Ephemeral});

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
                sent = true
            }
        }
    }
    if (!sent) {
        interaction.reply({ embeds: [pcEmbed] })
    }
}

