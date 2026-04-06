import { Client } from 'discord.js'
import express, { Request, Response } from 'express'
import { CustomEventType } from '../types.js';

export const data = {
    name: "Webhooks"
}
export async function start(client : Client) {

    const app = express();
    app.use(express.json());
    app.post("/staffingUpdate", (req : Request, res : Response) => {
        const { staffed } = req.body;
        client.triggerCustomEvent(CustomEventType.staffingUpdate, staffed);
        res.sendStatus(200);
    })
    app.listen(3030, () => {
        console.log("Webhook listener running on 3030...");
    });
}