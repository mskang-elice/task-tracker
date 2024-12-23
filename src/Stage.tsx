import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useStore, { SortOption, SortType, stageNames, Task } from "./useStore";
import TaskCard from "./TaskCard";
import DateInput from "./DateInput";
import { AddIcon, ArrowDownIcon, ArrowUpIcon, SortIcon } from "./Icons";
import Input from "./Input";

interface Props {
  stageId: number;
  movedTaskId: number | undefined;
  setMovedTaskId: (movedTaskId: number | undefined) => void;
}

function Stage({
  stageId,
  movedTaskId,
  setMovedTaskId,
}: Props) {
  const store = useStore();
  const stage = stageNames[stageId];
  const [tasks, setTasks] = useState(store.data.tasks.filter((task) => task.status === stageId));
  // sort of useMemo
  useEffect(() => {
    if (store.updatedStages.includes(stageId)) {
      setTasks(store.data.tasks.filter((task) => task.status === stageId));
    }
  }, [store.data.tasks])

  // ==============================[정렬 옵션]==============================
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortOption = store.data.sortOptions[stageId];
  const setSortOption = useCallback(
    (newSortOption: SortOption) => store.setSortOption(stageId, newSortOption), []
  );

  // ==============================[태스크 목록]==============================
  const sortedTasks = useMemo(() => tasks.sort((a, b) => {
    // 태스크 정렬 로직
    // 정렬할 값이 없으면 맨 뒤로
    const sortType = sortOption.sortType;
    const isAscending = sortOption.isAscending;
    if (!a[sortType]) return 1;
    if (!b[sortType]) return -1;
    if (a[sortType] === b[sortOption.sortType]) return 0;

    // isAscending에 따라 정렬
    const cmp = a[sortType] > b[sortType];
    return isAscending
      ? (cmp ? 1 : -1)
      : (cmp ? -1 : 1);
  }), [tasks, sortOption]);

  const handleSort = (newSortType: SortType) => {
    if (newSortType === sortOption.sortType) {
      setSortOption({
        ...sortOption,
        isAscending: !sortOption.isAscending,
      });
    } else {
      setSortOption({
        sortType: newSortType,
        isAscending: true,
      });
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
        <SortMenuButton
          ref={sortButtonRef}
          onClick={() => {
            if (isSortMenuOpen) {
              setIsSortMenuOpen(false);
            } else {
              setIsSortMenuOpen(true);
              sortPanelRef.current?.focus();
            }
          }}
          $isAscending={sortOption.isAscending}
        >
          <SortIcon />
          {sortOption.isAscending
            ? <ArrowUpIcon />
            : <ArrowDownIcon />
          }
        </SortMenuButton>
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
          {Object.values(SortType).map((curSortType) => {
            if (curSortType === SortType.expectedReviewAt && stageId !== 2) {
              return;
            }
            if (curSortType === SortType.expectedCompleteAt && stageId !== 3) {
              return;
            }
            return (
              <SortButton
                key={curSortType}
                $isActive={curSortType === sortOption.sortType}
                onClick={() => handleSort(curSortType)}
              >
                {curSortType}
              </SortButton>
            );
          })}
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

  /* background-color: red; */
`;

const ToolbarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 42px;

  padding: 8px 12px 8px 12px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  background-color: #ffffff;
  box-shadow: inset 0 -50px 90px -100px #6700e6;
`;

const StageName = styled.div`
  color: #5e26a1;
`;

const SortMenuButton = styled.button<{ $isAscending: boolean }>`
  width: 40px;
  height: 26px;

  border-radius: 13px;
  border: none;

  background-color: rgba(0, 0, 0, 0);
  box-shadow: inset 0 0 5px 2px #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #F7F7F9;
  }
`;

const SortMenuContainer = styled.div<{ $isOpen: boolean }>`
  width: 100px;
  height: ${({ $isOpen }) => $isOpen
    ? 'auto'
    : '0'
  };
  /* auto는 transition 불가 */
  /* transition: height 0.1s ease-in-out; */

  position: absolute;
  right: 0;
  top: 100%;

  z-index: 1;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  /* background-color: red; */
`;

const SortButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  height: 18px;

  border: none;

  background-color: ${({ $isActive }) => $isActive
    ? '#f8f8f8'
    : '#e8e8e8'
  };
  
  &:hover {
    border: solid 1px #000000;
  }

  &:hover:active {
    background-color: #ffffff;
  }
`;

const TaskWrapper = styled.div`
  width: 100%;
  max-height: calc(100vh - 170px);
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

  /* background-color: green; */
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