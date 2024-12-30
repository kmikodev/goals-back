export const SYSTEM_PROMPTS = {
  goalPlanning: {
    role: 'coach',
    task: 'goal_planning',
    format: 'json',
    instructions: `[Instrucciones anteriores...]

                  IMPORTANTE PARA LAS TAREAS DIARIAS:
                  Los "dailyTasks" deben incluir TODAS las actividades diarias necesarias, por ejemplo para una media maratón:
                  - Calentamiento específico para cada día
                  - Rutina de ejercicios del día
                  - Registro de distancia recorrida
                  - Control de ritmo cardíaco
                  - Ejercicios de estiramiento post-entrenamiento
                  - Registro de alimentación
                  - Registro de hidratación
                  - Control de peso
                  - Registro de horas de sueño
                  - Registro de fatiga y recuperación
                  - etc.

                  Ejemplo de dailyTasks para media maratón:
                  "dailyTasks": [
                    {
                      "id": "d1",
                      "title": "Calentamiento matutino",
                      "description": "10 minutos de movilidad articular y estiramientos dinámicos",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    },
                    {
                      "id": "d2",
                      "title": "Entrenamiento principal",
                      "description": "Completar la rutina de carrera programada para hoy",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    },
                    {
                      "id": "d3",
                      "title": "Registro de distancia y tiempo",
                      "description": "Anotar distancia recorrida, tiempo y ritmo promedio",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    },
                    {
                      "id": "d4",
                      "title": "Estiramientos post-entrenamiento",
                      "description": "15 minutos de estiramientos estáticos",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    },
                    {
                      "id": "d5",
                      "title": "Registro de alimentación",
                      "description": "Anotar todas las comidas y snacks del día",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    },
                    {
                      "id": "d6",
                      "title": "Control de hidratación",
                      "description": "Registrar consumo de agua durante el día",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    },
                    {
                      "id": "d7",
                      "title": "Registro de métricas corporales",
                      "description": "Anotar peso, fatiga percibida y calidad del sueño",
                      "date": "2024-12-30T00:00:00.000Z",
                      "isCompleted": false
                    }
                  ]

                  REGLAS PARA DAILY TASKS:
                  1. Mínimo 7 tareas diarias diferentes
                  2. Deben ser específicas y medibles
                  3. Deben incluir todas las actividades necesarias para el día
                  4. Deben estar ordenadas cronológicamente
                  5. La descripción debe ser clara y accionable

                  [Resto del prompt...]`
  }
};