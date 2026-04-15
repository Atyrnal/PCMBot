import { AirtableBase } from "airtable/lib/airtable_base.js";
import { ChatInputCommandInteraction, LabelComponent, MessageFlags, ModalBuilder, SlashCommandBuilder, TextInputStyle } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Discord account to the Makerspace's system")

export async function execute(interaction : ChatInputCommandInteraction) {
    const emailModal = new ModalBuilder().setCustomId("link-emailModal")
        .setTitle("Link Account")
        .addLabelComponents((e) => e
            .setLabel("Email").setTextInputComponent((t) => t
                .setCustomId("link-emailModal-emailInput")
                .setRequired(true)
                .setMaxLength(250)
                .setPlaceholder("Enter the email you used when registering at the PCM")
                .setStyle(TextInputStyle.Short)
            )
        )
    interaction.showModal(emailModal);
    //const airtable = interaction.client.integrations.get("airtable") as AirtableBase;
    //await airtable.table("Users").select({filterByFormula: `OR({Primary Email} = "${email}", {Alternate Email} = "${email}")`}).firstPage()
}