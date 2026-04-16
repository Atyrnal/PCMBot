import { AirtableBase } from "airtable/lib/airtable_base.js";
import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, MessageFlags, MessageFlagsBitField, ModalSubmitInteraction } from "discord.js";
import { GoogleAPI } from "../integrations/google.mjs";

const emailRegex = /^[-A-Za-z0-9!#$%&'*+\/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+\/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?$/i;
export const data = { name:"link-emailModal", type:InteractionType.ModalSubmit }
export async function execute(interaction : ModalSubmitInteraction) {
    await interaction.deferReply();
    const email = interaction.fields.getTextInputValue("link-emailModal-emailInput").toLowerCase();
    if (!emailRegex.test(email)) return interaction.followUp({ content: "Invalid Email. Please try again.", flags: MessageFlags.Ephemeral})
    const airtable = interaction.client.integrations.get("airtable") as AirtableBase;
    const records = await airtable.table("Users").select({filterByFormula: `OR(LOWER({Primary Email}) = LOWER("${email}"), LOWER({Alternate Email}) = LOWER("${email}"))`}).firstPage()
    const record = records[0];
    let exists = true;
    let linked = false;
    let linkedtoSelf = false;

    if (record === undefined) exists = false;
    
    let rid;
    if(exists && ((rid = record.get("Discord ID")) !== undefined)) {
        if ((rid === interaction.user.id)) linkedtoSelf=true;
        linked = true;
    } 
    if (linkedtoSelf) return interaction.followUp({ content: "Your accounts are already linked."});
    const records2 = await airtable.table("Users").select({filterByFormula: `{Discord ID} = "${interaction.user.id}"`}).firstPage()
    if (records2.length > 0) return interaction.followUp({ content: "Your Discord account is already linked to a different email."});
    if (linked && !linkedtoSelf) return interaction.followUp({ content: "A different Discord account is already linked for this user!"});
    if (!exists) return interaction.followUp({ content: "There is no PCM Account associated with this email. Please register the next time you come to the PCM.", flags: MessageFlags.Ephemeral})

    const verCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    interaction.client.datastores.get("verificationCodes")!.set(interaction.user.id, { email : email, code:verCode});
    //Send email
    try {
        const google = interaction.client.integrations.get('google') as GoogleAPI;
        const fullname = record.get('First Name') + " " + record.get('Last Name');
        const message = `Hello ${fullname.split(" ")[0]},<br><br>` + 
            `You are recieving this email because you requested to link your PCM account to Discord.<br><br>` +
            `Your verification code is:<br>` +
            `<b>${verCode}</b><br><br>` +
            `If you did not request this code, you can safely ignore this email.`
        const subject = "PCM Email Verification";
        const res = await google.gmail!.send({ name: fullname, email: email}, subject, message);
        //console.log(res);
    } catch (e) {
        console.error(e);
        return interaction.followUp({
            content: "Failed to send verification email. Contact MS Staff."
        });
    }

    const codeButtonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setCustomId('link-codeButton')
            .setLabel('Enter Code')
            .setStyle(ButtonStyle.Success)
        );
    
    const sentEmbed = new EmbedBuilder()
        .setTitle("Email Sent")
        .setDescription("Please check your email for a verification code.\nOnce you recieve the code, click the button below to verify your email.")

    interaction.followUp({
        embeds:[sentEmbed],
        components:[codeButtonRow]
    })

}