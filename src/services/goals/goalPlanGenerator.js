import { openai } from '../../config/openai.js';
import { SYSTEM_PROMPTS } from '../../utils/prompts.js';

export const generateGoalPlan = async (userPrompt) => {
  try {
    const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: JSON.stringify(SYSTEM_PROMPTS.goalPlanning)
        },
        {
          role: 'user',
          content: JSON.stringify({
            prompt: userPrompt,
            currentDate: new Date().toISOString()
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const planData = JSON.parse(response.choices[0].message.content);
    
    if (!planData.goal) {
      throw new Error('Invalid response format from GPT');
    }

    return planData.goal;
  } catch (error) {
    console.error('Error generating goal plan:', error);
    throw new Error('Failed to generate goal plan');
  }
};