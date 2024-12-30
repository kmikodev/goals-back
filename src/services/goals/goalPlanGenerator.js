import { openai } from '../../config/openai.js';
import { SYSTEM_PROMPTS } from '../../utils/prompts.js';

export const generateGoalPlan = async (userPrompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Respond with a JSON object following this structure for a goal plan. The response must be a valid JSON:
                   {
                     "goal": {
                       "title": string,
                       "description": string
                     },
                     "steps": [{
                       "id": number,
                       "weekNumber": number,
                       "title": string,
                       "description": string,
                       "date": string,
                       "metrics": string,
                       "frequency": string,
                       "isCompleted": boolean
                     }],
                     "milestones": [{
                       "title": string,
                       "description": string,
                       "dueDate": string,
                       "isCompleted": boolean
                     }],
                     "dailyTasks": [{
                       "id": string,
                       "title": string,
                       "description": string,
                       "date": string,
                       "isCompleted": boolean
                     }]
                   }`
        },
        {
          role: 'user',
          content: `Create a detailed JSON plan for: ${userPrompt}. Include at least 10 steps and 7 daily tasks.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content;
    console.log('Raw OpenAI response:', rawContent);

    let planData;
    try {
      planData = JSON.parse(rawContent);
      console.log('Parsed plan data:', planData);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }

    // Verificar la estructura básica
    if (!planData || typeof planData !== 'object') {
      throw new Error('Response is not an object');
    }

    // Validar cada sección por separado
    const validations = [
      { field: 'goal', type: 'object' },
      { field: 'steps', type: 'array' },
      { field: 'milestones', type: 'array' },
      { field: 'dailyTasks', type: 'array' }
    ];

    for (const { field, type } of validations) {
      if (!planData[field]) {
        throw new Error(`Missing ${field} in response`);
      }
      if (type === 'array' && !Array.isArray(planData[field])) {
        throw new Error(`${field} is not an array`);
      }
      if (type === 'object' && typeof planData[field] !== 'object') {
        throw new Error(`${field} is not an object`);
      }
    }

    // Verificar cantidades mínimas
    if (planData.steps.length < 10) {
      throw new Error(`Not enough steps (${planData.steps.length})`);
    }
    if (planData.dailyTasks.length < 7) {
      throw new Error(`Not enough daily tasks (${planData.dailyTasks.length})`);
    }

    // Si todo está bien, devolver el plan
    return planData;

  } catch (error) {
    console.error('Detailed error in generateGoalPlan:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw error;
  }
};