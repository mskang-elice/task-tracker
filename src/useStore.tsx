import { createContext, useContext, useState } from "react";

// 제목
// Jira 링크
// 상태: 구상 계획 진행 검수 완료
// 진행 기한: 날짜
// 검수 기한: 날짜
// 생성 시각: 날짜
// 계획 시작 시각: 날짜
// 진행 시작 시각: 날짜
// 검수 시작 시각: 날짜
// 완료 시각: 날짜

export interface Task {
  id: number; // ID
  title?: string; // 제목
  link?: string; // Jira 링크
  // 상태: 구상 계획 진행 검수 완료
  status: number;
  colorIdx: number; // 색상 ID (colors.ts)

  createdAt?: Date; // 생성 시각
  plannedAt?: Date; // 계획 시작 시각
  startedAt?: Date; // 진행 시작 시각
  reviewedAt?: Date; // 검수 시작 시각
  completedAt?: Date; // 완료 시각
  expectedReviewAt?: Date; // 검수 예정 시각
  expectedCompleteAt?: Date; // 완료 예정 시각
}

interface TaskRaw {
  colorIdx?: string;
  createdAt: string;
  startedAt: string;
  reviewedAt: string;
  completedAt: string;
  expectedReviewAt: string;
  expectedCompleteAt: string;
}

export enum SortType {
  id = 'id',
  title = 'title',
  createdAt = 'createdAt',
  plannedAt = 'plannedAt',
  startedAt = 'startedAt',
  reviewedAt = 'reviewedAt',
  completedAt = 'completedAt',
  expectedReviewAt = 'expectedReviewAt',
  expectedCompleteAt = 'expectedCompleteAt',
}

export interface SortOption {
  sortType: SortType,
  isAscending: boolean,
}

export const stageNames = ['구상', '계획', '진행', '검수', '완료'];

interface Data {
  nextId: number;
  tasks: Task[];
  sortOptions: SortOption[];
};

interface Store {
  data: Data;
  addTask: (newTask: Task) => void;
  removeTask: (taskId: number) => void;
  updateTask: (taskId: number, newTask: Task) => void;
  undo: () => void;
  redo: () => void;
  undoable: boolean;
  redoable: boolean;
  updatedStages: number[];
  setSortOption: (stageId: number, sortOption: SortOption) => void;
}

const defaultStore: Store = {
  data: {
    nextId: 0,
    tasks: [],
    sortOptions: [
      { sortType: SortType.id, isAscending: false },
      { sortType: SortType.id, isAscending: false },
      { sortType: SortType.id, isAscending: false },
      { sortType: SortType.id, isAscending: false },
      { sortType: SortType.id, isAscending: false },
    ],
  },
  addTask: () => { },
  removeTask: () => { },
  updateTask: () => { },
  undo: () => { },
  redo: () => { },
  undoable: false,
  redoable: false,
  updatedStages: [],
  setSortOption: () => { },
};

const storeContext = createContext<Store>(defaultStore);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storageData = window.localStorage.getItem('task-tracker-app')
    ? JSON.parse(window.localStorage.getItem('task-tracker-app')!)
    : null;
  const initData: Data = storageData
    ? {
      ...storageData,
      tasks: storageData.tasks.map((task: TaskRaw) => ({
        ...task,
        colorIdx: task.colorIdx || 0,
        createdAt: new Date(task.createdAt),
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
        reviewedAt: task.reviewedAt ? new Date(task.reviewedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        expectedReviewAt: task.expectedReviewAt ? new Date(task.expectedReviewAt) : undefined,
        expectedCompleteAt: task.expectedCompleteAt ? new Date(task.expectedCompleteAt) : undefined,
      })),
    }
    : {
      nextId: 1,
      tasks: [],
      sortOptions: [
        { sortType: SortType.id, isAscending: false },
        { sortType: SortType.id, isAscending: false },
        { sortType: SortType.id, isAscending: false },
        { sortType: SortType.id, isAscending: false },
        { sortType: SortType.id, isAscending: false },
      ],
    };

  const [data, setDataState] = useState<Data>(initData);
  const [undoHistory, setUndoHistory] = useState<Data[]>([]);
  const [redoHistory, setRedoHistory] = useState<Data[]>([]);
  const [updatedStages, setUpdatedStages] = useState<number[]>([0, 1, 2, 3, 4]);

  const undoable = undoHistory.length > 0;
  const redoable = redoHistory.length > 0;

  const setDataWithoutHistory = (newData: Data) => {
    window.localStorage.setItem('task-tracker-app', JSON.stringify(newData));
    setDataState(newData);
  };

  const setData = (newData: Data) => {
    setUndoHistory([...undoHistory, data]);
    setRedoHistory([]);
    setDataWithoutHistory(newData);
  };

  const undo = () => {
    if (!undoable) return;
    setUpdatedStages([0, 1, 2, 3, 4]);
    setRedoHistory([...redoHistory, data]);
    setDataWithoutHistory(undoHistory[undoHistory.length - 1]);
    setUndoHistory(undoHistory.slice(0, -1));
  };

  const redo = () => {
    if (!redoable) return;
    setUpdatedStages([0, 1, 2, 3, 4]);
    setUndoHistory([...undoHistory, data]);
    setDataWithoutHistory(redoHistory[redoHistory.length - 1]);
    setRedoHistory(redoHistory.slice(0, -1));
  };

  const setTasks = (newTasks: Task[]) => {
    setData({
      ...data,
      tasks: newTasks,
    });
  };

  const addTask = (newTask: Task) => {
    setUpdatedStages([newTask.status]);
    setData({
      ...data,
      nextId: data.nextId + 1,
      tasks: [...data.tasks, newTask],
    });
  };

  const removeTask = (taskId: number) => {
    setTasks(data.tasks.filter((task) => {
      if (task.id === taskId) {
        setUpdatedStages([task.status]);
        return false;
      }
      return true;
    }));
  };

  const updateTask = (taskId: number, newTask: Task) => {
    setTasks(data.tasks.map((task) => {
      if (task.id === taskId) {
        setUpdatedStages([task.status, newTask.status]);
        return newTask;
      }
      return task;
    }));
  };

  const setSortOption = (stageId: number, sortOption: SortOption) => {
    setUpdatedStages([]);
    setData({
      ...data,
      sortOptions: [
        ...data.sortOptions.slice(0, stageId),
        sortOption,
        ...data.sortOptions.slice(stageId + 1)
      ],
    })
  }

  const store: Store = {
    data,
    addTask,
    removeTask,
    updateTask,
    undo,
    redo,
    undoable,
    redoable,
    updatedStages,
    setSortOption,
  };
  return <storeContext.Provider value={store}>{children}</storeContext.Provider>;
};

const useStore = () => {
  return useContext(storeContext);
};

export default useStore;