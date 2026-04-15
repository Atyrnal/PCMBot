import Airtable from "airtable"

export const data = { name:"airtable" }
export async function init() {}
export const api = new Airtable({apiKey: process.env.AIRTABLE_KEY!}).base(process.env.AIRTABLE_BASE!);