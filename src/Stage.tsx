import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useStore, { SortType, stageNames, Task } from "./useStore";
import TaskCard from "./TaskCard";
// import ExpectedInput from "./ExpectedInput";
// import useDateInput from "./useDateInput";
import DateInput from "./DateInput";

interface Props {
  stageId: number;
  sortType: SortType;
  setSortType: (sortType: SortType) => void;
  isAscending: boolean;
  setIsAscending: (isAscending: boolean) => void;
  movedTaskId: number | undefined;
  setMovedTaskId: (movedTaskId: number | undefined) => void;
  tasks: Task[];
}

interface AddData {
  title: string;
}

function Stage({
  stageId,
  sortType,
  setSortType,
  isAscending,
  setIsAscending,
  movedTaskId,
  setMovedTaskId,
  tasks,
}: Props) {
  const store = useStore();
  const stage = stageNames[stageId];

  // 태스크 추가 패널
  const addPanelRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addData, setAddData] = useState<AddData>({ title: '' });
  const [expected, setExpected] = useState<Date | undefined>(undefined);
  // const { DateInput } = useDateInput(
  //   undefined,
  //   (inputDate) => setExpected(inputDate),
  // );

  // 태스크 애니메이션
  const [newTaskId, setNewTaskId] = useState<number | undefined>(undefined);

  const sortedTasks = useMemo(() => tasks.sort((a, b) => {
    // 태스크 정렬 로직
    // 정렬할 값이 없으면 맨 뒤로
    if (!a[sortType]) return 1;
    if (!b[sortType]) return -1;
    if (a[sortType] === b[sortType]) return 0;

    // isAscending에 따라 정렬
    const cmp = a[sortType] > b[sortType];
    return isAscending
      ? (cmp ? 1 : -1)
      : (cmp ? -1 : 1);
  }), [tasks, sortType, isAscending]);

  const addTask = () => {
    // 태스크 추가
    const newTask: Task = {
      id: store.data.nextId,
      title: addData.title,
      link: '',
      status: stageId,
      createdAt: new Date(),
      expectedReviewAt: stageId === 2 ? expected : undefined,
      expectedCompleteAt: stageId === 3 ? expected : undefined,
    };
    store.addTask(newTask);

    // 입력 필드 초기화
    setAddData({ title: '' });
    setIsAdding(false);

    // 신규 태스크 애니메이션 트리거
    setNewTaskId(newTask.id);
    setTimeout(() => {
      setNewTaskId(undefined);
    }, 1);
  };

  const handleSort = (newSortType: SortType) => {
    if (newSortType === sortType) {
      setIsAscending(!isAscending);
    } else {
      setSortType(newSortType);
      setIsAscending(true);
    }
  };

  const onMove = (taskId: number) => {
    // 이동 태스크 애니메이션 트리거
    setMovedTaskId(taskId);
    setTimeout(() => {
      setMovedTaskId(undefined);
    }, 1);
  };

  return (
    <Container>
      <div>{stage}</div>
      <ToolbarContainer>
        <SortButton onClick={() => handleSort(SortType.id)}>id</SortButton>
        <SortButton onClick={() => handleSort(SortType.title)}>title</SortButton>
        <SortButton onClick={() => handleSort(SortType.createdAt)}>createdAt</SortButton>
        <SortButton onClick={() => handleSort(SortType.plannedAt)}>plannedAt</SortButton>
        <SortButton onClick={() => handleSort(SortType.startedAt)}>startedAt</SortButton>
        <SortButton onClick={() => handleSort(SortType.reviewedAt)}>reviewedAt</SortButton>
        <SortButton onClick={() => handleSort(SortType.completedAt)}>completedAt</SortButton>
        {stageId === 2 && <SortButton onClick={() => handleSort(SortType.expectedReviewAt)}>expectedReviewAt</SortButton>}
        {stageId === 3 && <SortButton onClick={() => handleSort(SortType.expectedCompleteAt)}>expectedCompleteAt</SortButton>}
      </ToolbarContainer>
      <TaskContainer>
        {sortedTasks.map((task) =>
          <TaskCard
            key={task.id}
            task={task}
            isNew={newTaskId === task.id}
            isMoved={movedTaskId === task.id}
            onMove={() => onMove(task.id)}
          />
        )}
      </TaskContainer>
      <AddContainer
        ref={addPanelRef}
        tabIndex={0}
        onFocus={() => setIsAdding(true)}
        onBlur={(e) => {
          if (!addPanelRef.current?.contains(e.relatedTarget)) {
            setIsAdding(false)
          }
        }}
      >
        {isAdding
          ? <input
            autoFocus
            value={addData.title}
            onChange={(e) => setAddData({ title: e.target.value })}
            onKeyDown={(e) => {
              if (addData.title.length > 0 && e.key === 'Enter') {
                addTask();
              }
            }}
            placeholder="새 작업"
          />
          : <div>{addData.title || '새 작업'}</div>
        }
        {addData.title.length > 0 && <AddButton onClick={addTask}>add</AddButton>}
        {isAdding
          && addData.title.length > 0
          && (stageId === 2 || stageId === 3)
          && <DateInput
            onAddTask={addTask}
          />
        }
        {/* {isAdding
          && addData.title.length > 0
          && (stageId === 2 || stageId === 3)
          && <DateInput />
        } */}
        {/* {isAdding
          && addData.title.length > 0
          && (stageId === 2 || stageId === 3)
          && <ExpectedInput
            value={expected}
            setValue={(date) => setExpected(date)}
          />
        } */}
      </AddContainer>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ToolbarContainer = styled.div`
  width: 100%;
  height: 30px;
`;

const SortButton = styled.button`
`;

const TaskContainer = styled.div`
  width: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const AddContainer = styled.div`
  width: 100%;
  max-height: 30px;

  background-color: red;
`;

const AddButton = styled.button`
`;

export default Stage;