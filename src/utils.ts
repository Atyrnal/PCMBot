import { APIInteractionGuildMember, GuildMember } from 'discord.js'
import { createHash } from 'node:crypto';

export function isEmployee(member : GuildMember | APIInteractionGuildMember | null) : boolean {
    if (member == null) return false
    if (!(member instanceof GuildMember)) {
        return (process.env.EMPLOYEE_ROLE_ID != undefined && member.roles.includes(process.env.EMPLOYEE_ROLE_ID))
    }
    return member.guild.id != process.env.SERVER_ID || (process.env.EMPLOYEE_ROLE_ID != undefined && member.roles.cache.has(process.env.EMPLOYEE_ROLE_ID))
}


export function hashCommands(commands: object[]) {
    return createHash('md5').update(JSON.stringify(commands)).digest('hex');
}