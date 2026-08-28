import type { NeedType } from '../types';

export interface TaskPreset {
  label: string;
  restoreAmount: number;
}

export interface GoalPreset {
  title: string;
  tasks: TaskPreset[];
}

// Quick-fill suggestions shown as tappable chips during setup — never the
// only option, just a shortcut so most of onboarding is tapping, not typing.
export const GOAL_PRESETS: Record<NeedType, GoalPreset[]> = {
  food: [
    {
      title: 'Eat healthier',
      tasks: [
        { label: 'Cooked a real meal', restoreAmount: 5 },
        { label: 'Ate 3 meals today', restoreAmount: 4 },
        { label: 'Packed a healthy lunch', restoreAmount: 4 },
      ],
    },
    {
      title: 'Cook more at home',
      tasks: [
        { label: 'Made dinner instead of ordering out', restoreAmount: 6 },
        { label: 'Tried a new recipe', restoreAmount: 5 },
        { label: 'Meal-prepped for the week', restoreAmount: 8 },
      ],
    },
    {
      title: 'Cut back on takeout',
      tasks: [
        { label: 'Skipped ordering delivery', restoreAmount: 4 },
        { label: 'Brought lunch instead of buying', restoreAmount: 4 },
      ],
    },
  ],
  water: [
    {
      title: 'Stay hydrated',
      tasks: [
        { label: 'Drank 8 glasses of water', restoreAmount: 5 },
        { label: 'Refilled my water bottle', restoreAmount: 2 },
        { label: 'Skipped a sugary drink', restoreAmount: 3 },
      ],
    },
    {
      title: 'Cut back on caffeine',
      tasks: [
        { label: 'Had water instead of coffee/soda', restoreAmount: 4 },
        { label: 'Stopped caffeine after noon', restoreAmount: 4 },
      ],
    },
  ],
  shelter: [
    {
      title: 'Keep my space organized',
      tasks: [
        { label: 'Cleaned the kitchen', restoreAmount: 5 },
        { label: 'Did a load of laundry', restoreAmount: 5 },
        { label: 'Decluttered a room', restoreAmount: 4 },
      ],
    },
    {
      title: 'Stay on top of chores',
      tasks: [
        { label: 'Took out the trash', restoreAmount: 2 },
        { label: 'Vacuumed or swept', restoreAmount: 4 },
        { label: 'Made the bed', restoreAmount: 2 },
      ],
    },
    {
      title: 'Handle home admin',
      tasks: [
        { label: 'Paid a bill', restoreAmount: 4 },
        { label: 'Filed or organized paperwork', restoreAmount: 4 },
      ],
    },
  ],
  weather: [
    {
      title: 'Plan ahead',
      tasks: [
        { label: 'Checked the forecast and planned accordingly', restoreAmount: 3 },
        { label: 'Packed for the day (umbrella/layers)', restoreAmount: 2 },
      ],
    },
    {
      title: 'Manage my schedule',
      tasks: [
        { label: "Reviewed tomorrow's calendar", restoreAmount: 3 },
        { label: 'Set out clothes/gear for tomorrow', restoreAmount: 2 },
      ],
    },
    {
      title: 'Be prepared for the unexpected',
      tasks: [{ label: 'Checked in on an emergency plan or kit', restoreAmount: 5 }],
    },
  ],
  rest: [
    {
      title: 'Get better sleep',
      tasks: [
        { label: 'Went to bed on time', restoreAmount: 5 },
        { label: 'No screens before bed', restoreAmount: 3 },
        { label: 'Woke up without hitting snooze', restoreAmount: 3 },
      ],
    },
    {
      title: 'Take real breaks',
      tasks: [
        { label: 'Took a break away from my desk', restoreAmount: 3 },
        { label: 'Had a screen-free evening', restoreAmount: 5 },
      ],
    },
    {
      title: 'Recharge on weekends',
      tasks: [{ label: 'Took a full rest day', restoreAmount: 6 }],
    },
  ],
  health: [
    {
      title: 'Move every day',
      tasks: [
        { label: 'Went for a walk', restoreAmount: 4 },
        { label: 'Worked out', restoreAmount: 6 },
        { label: 'Took the stairs', restoreAmount: 2 },
      ],
    },
    {
      title: 'Build a fitness habit',
      tasks: [
        { label: 'Did a workout class', restoreAmount: 6 },
        { label: 'Stretched or did mobility work', restoreAmount: 3 },
      ],
    },
    {
      title: 'Take care of my body',
      tasks: [
        { label: 'Went to a checkup or appointment', restoreAmount: 6 },
        { label: 'Took my vitamins/meds', restoreAmount: 2 },
      ],
    },
  ],
};

// Flat, deduped-by-label task suggestions for a need, pooled across all of
// its goal presets — shown as quick-add chips regardless of which goal
// title the user ends up with.
export function commonTasksFor(needType: NeedType): TaskPreset[] {
  const seen = new Set<string>();
  const tasks: TaskPreset[] = [];
  for (const preset of GOAL_PRESETS[needType]) {
    for (const task of preset.tasks) {
      if (seen.has(task.label)) continue;
      seen.add(task.label);
      tasks.push(task);
    }
  }
  return tasks;
}

// Task suggestions scoped to the specific goal, not every goal under the same
// need — e.g. "Drank 8 glasses of water" shouldn't show up as a suggestion
// for "Stay on top of chores" just because they're both under Water/Shelter.
// Falls back to the need's full pool only for a custom (non-preset) title.
export function tasksForGoal(needType: NeedType, title: string): TaskPreset[] {
  const preset = GOAL_PRESETS[needType].find((p) => p.title === title);
  return preset ? preset.tasks : commonTasksFor(needType);
}
