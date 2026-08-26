export interface TaskPreset {
  id: string;
  label: string;
  foodReward: number;
}

export interface Species {
  id: string;
  name: string;
  image: string;
  tagline: string;
  goalDescription: string;
  foodName: string;
  foodEmoji: string;
  presetTasks: TaskPreset[];
}

export interface CustomTask {
  id: string;
  label: string;
  foodReward: number;
}

export interface TaskLogEntry {
  id: string;
  taskLabel: string;
  foodEarned: number;
  completedAt: number;
}

export interface Pet {
  id: string;
  speciesId: string;
  nickname: string;
  level: number;
  xp: number;
  hunger: number;
  foodInventory: number;
  customTasks: CustomTask[];
  taskLog: TaskLogEntry[];
  createdAt: number;
  lastUpdatedAt: number;
}
