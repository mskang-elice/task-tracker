import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useStore, { SortType, stageNames, Task } from "./useStore";
import TaskCard from "./TaskCard";
import DateInput from "./DateInput";
import { AddIcon, ArrowDownIcon, ArrowUpIcon, SortIcon } from "./Icons";
import Input from "./Input";

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

  // ==============================[정렬 옵션]==============================
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

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
  const addTitleInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [expected, setExpected] = useState<Date | undefined>(undefined);
  const [addLink, setAddLink] = useState('');

  // 신규 태스크 애니메이션 재생용 상태
  const [newTaskId, setNewTaskId] = useState<number | undefined>(undefined);

  const addTask = (expectedDate: Date | undefined) => {
    if (addTitle.length === 0) {
      return;
    }

    // 태스크 추가
    const newTask: Task = {
      id: store.data.nextId,
      title: addTitle,
      link: addLink === '' ? undefined : addLink,
      status: stageId,
      colorIdx: 0,
      createdAt: new Date(),
      expectedReviewAt: stageId === 2 ? expectedDate : undefined,
      expectedCompleteAt: stageId === 3 ? expectedDate : undefined,
    };
    store.addTask(newTask);

    // 입력 필드 초기화
    setAddTitle('');
    setAddLink('');
    setIsAdding(false);

    // 신규 태스크 애니메이션 트리거
    setNewTaskId(newTask.id);
    setTimeout(() => {
      setNewTaskId(undefined);
    }, 1);

    // 입력 필드로 포커스
    addTitleInputRef.current?.focus();
  };

  return (
    <Container>
      <ToolbarContainer>
        <StageName>{stage}</StageName>
        <SortButton
          ref={sortButtonRef}
          onClick={() => {
            if (isSortMenuOpen) {
              setIsSortMenuOpen(false);
            } else {
              setIsSortMenuOpen(true);
              sortPanelRef.current?.focus();
            }
          }}
          $isAscending={isAscending}
        >
          <SortIcon />
          {isAscending
            ? <ArrowUpIcon />
            : <ArrowDownIcon />
          }
        </SortButton>
        <SortMenuContainer
          ref={sortPanelRef}
          $isOpen={isSortMenuOpen}
          tabIndex={0}
          onBlur={(e) => {
            if (!sortPanelRef.current?.contains(e.relatedTarget)
              && e.relatedTarget !== sortButtonRef.current
            ) {
              setIsSortMenuOpen(false);
            }
          }}
        >
          <SortOption onClick={() => handleSort(SortType.id)}>id</SortOption>
          <SortOption onClick={() => handleSort(SortType.title)}>title</SortOption>
          <SortOption onClick={() => handleSort(SortType.createdAt)}>createdAt</SortOption>
          <SortOption onClick={() => handleSort(SortType.plannedAt)}>plannedAt</SortOption>
          <SortOption onClick={() => handleSort(SortType.startedAt)}>startedAt</SortOption>
          <SortOption onClick={() => handleSort(SortType.reviewedAt)}>reviewedAt</SortOption>
          <SortOption onClick={() => handleSort(SortType.completedAt)}>completedAt</SortOption>
          {stageId === 2 && <SortOption onClick={() => handleSort(SortType.expectedReviewAt)}>expectedReviewAt</SortOption>}
          {stageId === 3 && <SortOption onClick={() => handleSort(SortType.expectedCompleteAt)}>expectedCompleteAt</SortOption>}
        </SortMenuContainer>
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
          <Input
            ref={addTitleInputRef}
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTask(expected); // Stage 내부 일자 상태 사용
              }
            }}
            placeholder="새 작업"
          />
          {(stageId === 2 || stageId === 3) &&
            <DateInput
              onConfirmDate={setExpected} // Stage 내부 일자 상태 업데이트
              onEnterDown={addTask} // DateInput에서 직접 일자 전달
            />
          }
          <Input
            value={addLink}
            onChange={(e) => setAddLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTask(expected); // Stage 내부 일자 상태 사용
              }
            }}
            placeholder="링크"
          />
          <AddButton
            onClick={() => addTask(expected)}
            disabled={addTitle.length === 0}
          >
            <AddIcon />
          </AddButton>
        </AddContainer>
      </AddWrapper>
    </Container >
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ToolbarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 30px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  /* background-color: gold; */
`;

const StageName = styled.div`
  
`;

const SortButton = styled.button<{ $isAscending: boolean }>`
`;

const SortMenuContainer = styled.div<{ $isOpen: boolean }>`
  width: 100px;
  height: ${({ $isOpen }) => $isOpen
    ? 'auto'
    : '0'
  };
  /* auto는 transition 불가가 */
  /* transition: height 0.1s ease-in-out; */

  position: absolute;
  right: 0;
  top: 30px;

  z-index: 1;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  /* background-color: red; */
`;

const SortOption = styled.button`
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
  /* height: 100px; */

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 5px;

  /* background-color: red; */
`

const AddContainer = styled.div<{ $isActive: boolean }>`
  width: 100%;
  height: 100%;

  position: relative;

  border-radius: 15px;

  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;

  /* background-color: green; */
`;

const AddButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;

  position: absolute;
  right: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #d8d8d8;

  background-color: #ffffff;
  &:hover {
    background-color: #d8d6d6;
  }

  &:disabled {
    background-color: #e8e8e8;
  }

  &:not([disabled]):hover {
    background-color: #F7F7F9;
  }
`;

export default Stage;