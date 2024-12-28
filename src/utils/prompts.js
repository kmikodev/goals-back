export const SYSTEM_PROMPTS = {
    goalPlanning: {
      role: 'coach',
      task: 'goal_planning',
      format: 'json',
      instructions: `Create a detailed goal plan with milestones and daily tasks. 
                    The response must follow this exact structure in spanish:
                    { 
                      "goal": {
                        "title": string,
                        "description": string,
                        "milestones": [{
                          "title": string,
                          "description": string,
                          "dueDate": ISO date string
                        }],
                        "dailyTasks": [{
                          "title": string,
                          "description": string,
                          "date": ISO date string
                        }]
                      }
                    }`
    }
  };