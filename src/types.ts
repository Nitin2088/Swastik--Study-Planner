/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'Completed';
export type TimeBlock = 'Morning' | 'Afternoon' | 'Evening';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
}
