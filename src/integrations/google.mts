import * as gmail from '@googleapis/gmail';
import * as people from '@googleapis/people';
import * as http from 'http';
import * as url from 'url';
import open from 'open';
import { writeFile,readFile } from 'fs/promises';
import { existsSync } from 'fs';

const oauth2 = new gmail.auth.OAuth2(process.env.GAUTH_CLIENT_ID, process.env.GAUTH_SECRET, "http://localhost:3000/oauth2callback");

export const data = { name:"google" }
export async function init() {
    if (existsSync(".gauth.json.secret")) {
        await readFile(".gauth.json.secret", "utf-8").then(JSON.parse).then(oauth2.setCredentials.bind(oauth2));
    } else {
        await googleauth();
    }
    api.gmail = new GmailWrapper(gmail.gmail({
        version: 'v1',
        auth : oauth2
    }));
    api.people = people.people({
        version: 'v1',
        auth: oauth2
    })
}

export const api : GoogleAPI = {
    people : undefined,
    gmail : undefined
}


async function googleauth() {
    return new Promise((res, rej) => {
        const aurl = oauth2.generateAuthUrl({ access_type:"offline", scope:["https://www.googleapis.com/auth/contacts.readonly", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/contacts.other.readonly", "https://www.googleapis.com/auth/directory.readonly"]})
        const server = http.createServer(async (req, resp)=> {
            try {
                if (req.url && req.url.indexOf("/oauth2callback") > -1) {
                    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                    resp.end('Authentication successful! Please return to the console.');
                    server.closeAllConnections();
                    const {tokens} =  await oauth2.getToken(qs.get('code')!);
                    oauth2.credentials = tokens;
                    if (tokens.refresh_token) writeFile(".gauth.json.secret", JSON.stringify(tokens, null, 2))
                    res(oauth2);
                }
            } catch (e) {
                rej(e)
            }
        })
        server.listen(3000, () => {
            open(aurl, {wait: false}).then(cp => cp.unref());
        });
    })
}

export type GoogleAPI = {
    gmail : GmailWrapper | undefined,
    people: people.people_v1.People | undefined
}

class GmailWrapper {
    constructor(private api : gmail.gmail_v1.Gmail) {}
    async send(to : { name : string, email : string}, subject : string, body : string ) {
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const message = [
            "From: Physical Computing Makerspace <pcm@umass.edu>",
            `To: ${to.name} <${to.email}>`,
            "Content-Type: text/html; charset=utf-8",
            "MIME-Version: 1.0",
            `Subject: ${utf8Subject}`,
            "",
            body
        ].join("\n")

         const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

       return await this.api.users.messages.send({
        userId:'me',
        requestBody: {
            raw:encodedMessage
        }
       });
    }
}