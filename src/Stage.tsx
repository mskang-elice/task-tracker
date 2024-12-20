import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useStore, { SortType, stageNames, Task } from "./useStore";
import TaskCard from "./TaskCard";
import DateInput from "./DateInput";
import { AddIcon } from "./Icons";

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

  // ==============================[태스크 목록]==============================
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

  // ==============================[태스크 추가 패널]==============================
  const addPanelRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addData, setAddData] = useState<AddData>({ title: '' });
  const [expected, setExpected] = useState<Date | undefined>(undefined);

  // 신규 태스크 애니메이션 재생용 상태
  const [newTaskId, setNewTaskId] = useState<number | undefined>(undefined);

  const addTask = (expectedDate: Date | undefined) => {
    // 태스크 추가
    const newTask: Task = {
      id: store.data.nextId,
      title: addData.title,
      link: '',
      status: stageId,
      colorIdx: 0,
      createdAt: new Date(),
      expectedReviewAt: stageId === 2 ? expectedDate : undefined,
      expectedCompleteAt: stageId === 3 ? expectedDate : undefined,
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
      <TaskWrapper>
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
      </TaskWrapper>
      <AddWrapper>
        <AddContainer
          ref={addPanelRef}
          $isActive={isAdding}
          tabIndex={0}
          onFocus={() => {
            setIsAdding(true);
            setExpected(undefined);
          }}
          onBlur={(e) => {
            if (!addPanelRef.current?.contains(e.relatedTarget)) {
              setIsAdding(false)
            }
          }}
        >
          <AddTitleInput
            autoFocus
            value={addData.title}
            onChange={(e) => setAddData({ title: e.target.value })}
            onKeyDown={(e) => {
              if (addData.title.length > 0 && e.key === 'Enter') {
                addTask(expected); // Stage 내부 일자 상태 사용
              }
            }}
            placeholder="새 작업"
          />
          {addData.title.length > 0
            && (stageId === 2 || stageId === 3)
            && <DateInput
              onConfirmDate={setExpected} // Stage 내부 일자 상태 업데이트
              onEnterDown={(date) => {
                // DateInput에서 직접 일자 전달
                if (addData.title.length > 0) {
                  addTask(date);
                }
              }}
            />
          }
          <AddButton onClick={() => addTask(expected)}>
            <AddIcon />
          </AddButton>
        </AddContainer>
      </AddWrapper>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const ToolbarContainer = styled.div`
  width: 100%;
  height: 30px;
`;

const SortButton = styled.button`
`;

const TaskWrapper = styled.div`
  width: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
`

const TaskContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AddWrapper = styled.div`
  width: 100%;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: red;
`

const AddContainer = styled.div<{ $isActive: boolean }>`
  width: 100%;
  height: 100%;

  border-radius: 20px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  background-color: green;
`;

const AddTitleInput = styled.input`
  width: 100px;
`;

const AddButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;

  background-color: #ffffff;
  &:hover {
    background-color: #d8d6d6;
  }
`;

export default Stage;