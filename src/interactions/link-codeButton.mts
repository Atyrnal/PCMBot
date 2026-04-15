
import { AirtableBase } from "airtable/lib/airtable_base.js";
import { ButtonInteraction, InteractionType, MessageFlags, ModalBuilder, TextInputStyle } from "discord.js";

export const data = { name:"link-codeButton", type:InteractionType.MessageComponent }
export async function execute(interaction : ButtonInteraction) {

    if (interaction.client.datastores.get("verificationCodes")!.get(interaction.user.id) !== undefined) {
        const codeModal = new ModalBuilder().setCustomId("link-codeModal")
        .setTitle("Verify Email")
        .addLabelComponents((e) => e
            .setLabel("Verification Code").setTextInputComponent((t) => t
                .setCustomId("link-codeModal-codeInput")
                .setRequired(true)
                .setMaxLength(6)
                .setPlaceholder("Enter code")
                .setStyle(TextInputStyle.Short)
            )
        )
        interaction.showModal(codeModal);
    } else {
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
    }
    
}