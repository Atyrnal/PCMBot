import { APIInteractionGuildMember, GuildMember } from 'discord.js'
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

export async function loadModules(dirPath : string, loadModule : (modulePath : string) => Promise<void>, fileFilter: (f: string) => boolean = f=>(f.endsWith(".ts")||f.endsWith(".mts")||f.endsWith(".js")||f.endsWith(".mjs"))) : Promise<number> {
    let found = 0
    if (existsSync(dirPath)) {
        const moduleFolders = readdirSync(dirPath)
        for (const folder of moduleFolders) {
            const modulesPath = join(dirPath, folder)
            if (statSync(modulesPath).isDirectory()) {
                const moduleFiles = readdirSync(modulesPath).filter(fileFilter)
                for (const file of moduleFiles) {
                    const modulePath = join(modulesPath, file);
                    await loadModule(modulePath)
                    found++
                }
            } else if (fileFilter(modulesPath)) {
                await loadModule(modulesPath)
                found++
            }
        }
    }
    return found;
}