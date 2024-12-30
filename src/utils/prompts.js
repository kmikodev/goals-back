export const SYSTEM_PROMPTS = {
  goalPlanning: {
    role: 'coach',
    task: 'goal_planning',
    format: 'json',
    instructions: `Crea un plan detallado para alcanzar la meta especificada.
                  El plan debe estar organizado en periodos de tiempo (generalmente semanas) con acciones específicas y medibles.
                  Cada periodo debe incluir:
                  - Fechas exactas
                  - Acciones concretas y cuantificables
                  - Métricas de éxito

                  La respuesta debe seguir esta estructura en español:
                  { 
                    "goal": {
                      "title": string,
                      "description": string,
                      "timeline": [{
                        "period": string, // ej: "Semana 1 (1-7 Enero)"
                        "dateStart": ISO date string,
                        "dateEnd": ISO date string,
                        "actions": [{
                          "id": number,
                          "title": string,
                          "description": string,
                          "metric": string, // ej: "Máximo 2 cigarrillos diarios"
                          "frequency": string // ej: "Diario", "Cada dos días", "Semanal"
                        }],
                        "weeklyGoal": string // ej: "Reducir a 2 cigarrillos diarios y empezar actividad física"
                      }]
                    }
                  }`
  }
};