import { AirtableBase } from "airtable/lib/airtable_base.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalSubmitInteraction } from "discord.js"

const codeRegex = /^\d{6}$/
export const data = { name:"link-codeModal", type:InteractionType.ModalSubmit }
export async function execute(interaction : ModalSubmitInteraction) {
    const code = interaction.fields.getTextInputValue("link-codeModal-codeInput");
    

    let codeValid = true;
    if (!codeRegex.test(code)) codeValid = false;
    const dsEntry = interaction.client.datastores.get("verificationCodes")!.get(interaction.user.id);
    if (code !== dsEntry.code) codeValid = false;

    if (!codeValid) {
        const codeButtonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setCustomId('link-codeButton')
                .setLabel('Re-Enter Code')
                .setStyle(ButtonStyle.Danger)
            );
        
        const sentEmbed = new EmbedBuilder()
            .setTitle("Invalid Code")
            .setDescription("Please make sure your code is correct and you are using the most recently sent code.")
            .setColor("#ff4444")
    
        interaction.reply({
            embeds:[sentEmbed],
            components:[codeButtonRow]
        })
    } else {
        await interaction.deferReply()
        const airtable = interaction.client.integrations.get("airtable") as AirtableBase;
        const records = await airtable.table("Users").select({filterByFormula: `OR({Primary Email} = "${dsEntry.email}", {Alternate Email} = "${dsEntry.email}")`}).firstPage()
        const record = records[0];
        if (record === undefined) return interaction.followUp("There is no PCM Account associated with this email. Please register the next time you come to the PCM.");
        if(record.get("Discord ID") !== undefined) return interaction.followUp({ content: "A Discord account is already linked for this user!"});
        await record.patchUpdate({ "Discord ID": interaction.user.id, "Email Verified" : true});
        interaction.followUp("Your accounts have been linked successfully.");
    }
}