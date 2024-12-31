import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});