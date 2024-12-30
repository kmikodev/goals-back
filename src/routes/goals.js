import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { Goal } from '../models/Goal.js';
import { Milestone } from '../models/Milestone.js';
import { DailyTask } from '../models/DailyTask.js';
import { Step } from '../models/Step.js';
import { generateGoalPlan } from '../services/goals/goalPlanGenerator.js';

const router = express.Router();

// Get all goals (basic info only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const goals = await Goal.find({ userId })
      .select('-prompt')
      .sort({ createdAt: -1 });
    
    res.json(goals);
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

// Get goal details including milestones and daily tasks
router.get('/:id/details', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const goal = await Goal.findOne({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const [steps, milestones, dailyTasks] = await Promise.all([
      Step.find({ goalId: id }),
      Milestone.find({ goalId: id }),
      DailyTask.find({ goalId: id })
    ]);

    res.json({
      ...goal.toObject(),
      steps,
      milestones,
      dailyTasks
    });
  } catch (error) {
    console.error('Error getting goal details:', error);
    res.status(500).json({ error: 'Failed to get goal details' });
  }
});
// Create new goal with AI-generated plan
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate, duration } = req.body;
    const userId = req.user.uid;
    const prompt = `${title} ${description}`;
    
    // Generate plan using GPT
    console.log('Generating plan for:', prompt);
    const planData = await generateGoalPlan(prompt);
    console.log('Received plan data:', planData);

    // Create goal
    const goal = new Goal({
      userId,
      title: planData.goal?.title || title,
      description: planData.goal?.description || description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration,
      prompt,
      isPremium: false
    });

    await goal.save();

    // Create steps
    const steps = planData.steps ? await Promise.all(
      planData.steps.map(step => 
        new Step({
          goalId: goal._id,
          weekNumber: step.weekNumber,
          title: step.title,
          description: step.description,
          date: new Date(step.date),
          metrics: step.metrics,
          frequency: step.frequency,
          isCompleted: false
        }).save()
      )
    ) : [];

    // Create milestones
    const milestones = planData.milestones ? await Promise.all(
      planData.milestones.map(milestone => 
        new Milestone({
          goalId: goal._id,
          title: milestone.title,
          description: milestone.description,
          dueDate: new Date(milestone.dueDate),
          isCompleted: false
        }).save()
      )
    ) : [];

    // Create daily tasks
    const dailyTasks = planData.dailyTasks ? await Promise.all(
      planData.dailyTasks.map(task => 
        new DailyTask({
          goalId: goal._id,
          title: task.title,
          description: task.description,
          date: new Date(task.date),
          isCompleted: false
        }).save()
      )
    ) : [];

    const result = {
      ...goal.toObject(),
      steps,
      milestones,
      dailyTasks
    };

    console.log('Created goal with all data:', result);
    res.json(result);

  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create goal',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});



// Update goal progress
router.patch('/:id/progress', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, isCompleted } = req.body;
    const userId = req.user.uid;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { progress, isCompleted },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

export default router;