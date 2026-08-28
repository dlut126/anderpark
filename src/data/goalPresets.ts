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
//
// Deliberately NOT themed to their need (no "eat healthier" under Food,
// "stay hydrated" under Water, etc.) — real goals like "do homework" or
// "go to the gym" don't naturally sort into food/water/shelter/weather/
// rest/health buckets, and pretending they do just makes the suggestions
// feel narrower than they should. Which need a goal is filed under is
// bookkeeping for the app, not something the goal is supposed to be "about."
export const GOAL_PRESETS: Record<NeedType, GoalPreset[]> = {
  food: [
    {
      title: 'Do homework',
      tasks: [
        { label: 'Finished a homework assignment', restoreAmount: 5 },
        { label: 'Studied for an hour', restoreAmount: 4 },
        { label: 'Turned in an assignment on time', restoreAmount: 5 },
      ],
    },
    {
      title: 'Work on a side project',
      tasks: [
        { label: 'Made progress on my project', restoreAmount: 5 },
        { label: 'Fixed a bug', restoreAmount: 4 },
        { label: 'Shipped a small feature', restoreAmount: 7 },
      ],
    },
    {
      title: 'Learn a new language',
      tasks: [
        { label: 'Practiced vocabulary', restoreAmount: 3 },
        { label: 'Completed a lesson', restoreAmount: 4 },
        { label: 'Had a conversation practice session', restoreAmount: 6 },
      ],
    },
  ],
  water: [
    {
      title: 'Go to the gym',
      tasks: [
        { label: 'Completed a workout', restoreAmount: 6 },
        { label: 'Did cardio', restoreAmount: 4 },
        { label: 'Hit a new personal record', restoreAmount: 8 },
      ],
    },
    {
      title: 'Read more',
      tasks: [
        { label: 'Read a chapter', restoreAmount: 3 },
        { label: 'Finished a book', restoreAmount: 8 },
        { label: 'Read for 30 minutes', restoreAmount: 3 },
      ],
    },
    {
      title: 'Practice an instrument',
      tasks: [
        { label: 'Practiced for 30 minutes', restoreAmount: 4 },
        { label: 'Learned a new song', restoreAmount: 6 },
        { label: 'Ran through scales', restoreAmount: 3 },
      ],
    },
  ],
  shelter: [
    {
      title: 'Clean the house',
      tasks: [
        { label: 'Cleaned the kitchen', restoreAmount: 5 },
        { label: 'Vacuumed', restoreAmount: 4 },
        { label: 'Did a load of laundry', restoreAmount: 5 },
      ],
    },
    {
      title: 'Declutter',
      tasks: [
        { label: 'Cleared out a drawer', restoreAmount: 3 },
        { label: 'Donated old items', restoreAmount: 5 },
        { label: 'Organized a closet', restoreAmount: 5 },
      ],
    },
    {
      title: 'Handle life admin',
      tasks: [
        { label: 'Paid a bill', restoreAmount: 3 },
        { label: 'Filed paperwork', restoreAmount: 4 },
        { label: 'Scheduled an appointment', restoreAmount: 3 },
      ],
    },
  ],
  weather: [
    {
      title: 'Plan ahead',
      tasks: [
        { label: 'Planned tomorrow', restoreAmount: 3 },
        { label: 'Reviewed my calendar', restoreAmount: 3 },
        { label: 'Made a to-do list for the week', restoreAmount: 4 },
      ],
    },
    {
      title: 'Job hunting',
      tasks: [
        { label: 'Applied for a job', restoreAmount: 6 },
        { label: 'Updated my resume', restoreAmount: 5 },
        { label: 'Sent a networking email', restoreAmount: 4 },
      ],
    },
    {
      title: 'Study for an exam',
      tasks: [
        { label: 'Reviewed lecture notes', restoreAmount: 4 },
        { label: 'Did practice problems', restoreAmount: 5 },
        { label: 'Made a study guide', restoreAmount: 5 },
      ],
    },
  ],
  rest: [
    {
      title: 'Journal',
      tasks: [
        { label: 'Wrote a journal entry', restoreAmount: 3 },
        { label: 'Reflected on the day', restoreAmount: 3 },
        { label: 'Wrote down three good things', restoreAmount: 2 },
      ],
    },
    {
      title: 'Meditate',
      tasks: [
        { label: 'Did a meditation session', restoreAmount: 4 },
        { label: 'Practiced deep breathing', restoreAmount: 2 },
        { label: 'Took a mindful walk', restoreAmount: 3 },
      ],
    },
    {
      title: 'Call a family member',
      tasks: [
        { label: 'Called a parent', restoreAmount: 4 },
        { label: 'Checked in with a friend', restoreAmount: 3 },
        { label: 'Sent a thoughtful message', restoreAmount: 2 },
      ],
    },
  ],
  health: [
    {
      title: 'Cook at home',
      tasks: [
        { label: 'Cooked dinner from scratch', restoreAmount: 5 },
        { label: 'Meal-prepped for the week', restoreAmount: 7 },
        { label: 'Tried a new recipe', restoreAmount: 5 },
      ],
    },
    {
      title: 'Practice a hobby',
      tasks: [
        { label: 'Worked on a craft project', restoreAmount: 4 },
        { label: 'Painted or drew something', restoreAmount: 4 },
        { label: 'Played a game I enjoy', restoreAmount: 3 },
      ],
    },
    {
      title: 'Volunteer',
      tasks: [
        { label: 'Volunteered for an hour', restoreAmount: 6 },
        { label: 'Helped a neighbor', restoreAmount: 4 },
        { label: 'Donated to a cause', restoreAmount: 3 },
      ],
    },
  ],
};

// Task suggestions scoped to the specific goal, not every goal filed under
// the same need — falls back to that need's full pool only for a custom
// (non-preset) title.
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

export function tasksForGoal(needType: NeedType, title: string): TaskPreset[] {
  const preset = GOAL_PRESETS[needType].find((p) => p.title === title);
  return preset ? preset.tasks : commonTasksFor(needType);
}
