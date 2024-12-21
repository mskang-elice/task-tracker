import { useRef } from "react";
import styled from "styled-components";
import useStore, { stageNames, Task } from "./useStore";
import { useEffect, useState } from "react";
import DateInput from "./DateInput";
import { CancelIcon, ConfirmIcon, MenuIcon, MoreIcon, RemoveIcon, StepIcon } from "./Icons";
import { colors } from "./colors";

interface Props {
  task: Task;
  isNew?: boolean;
  isMoved?: boolean;
  onMove?: () => void;
};

function TaskCard({ task, isNew, isMoved, onMove }: Props) {
  const store = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const moveHandler = (newStatus: number) => {
    const newTask = {
      ...task,
      status: newStatus,
      plannedAt: task.status < 1 && newStatus === 1 ? new Date() : task.plannedAt,
      startedAt: task.status < 2 && newStatus === 2 ? new Date() : task.startedAt,
      reviewedAt: task.status < 3 && newStatus === 3 ? new Date() : task.reviewedAt,
      completedAt: task.status < 4 && newStatus === 4 ? new Date() : task.completedAt,
    };
    store.updateTask(task.id, newTask);
    onMove?.();
  };

  const updateTask = (newTask: Task) => {
    // 이전 태스크에서 변경 사항이 있는지 확인하고, 있을 때만 실제로 저장소에 반영
    // id, status는 변경 체크 안함
    if (
      newTask.title === task.title
      && newTask.link === task.link
      && newTask.colorIdx === task.colorIdx
      && newTask.createdAt?.valueOf() === task.createdAt?.valueOf()
      && newTask.plannedAt?.valueOf() === task.plannedAt?.valueOf()
      && newTask.startedAt?.valueOf() === task.startedAt?.valueOf()
      && newTask.reviewedAt?.valueOf() === task.reviewedAt?.valueOf()
      && newTask.completedAt?.valueOf() === task.completedAt?.valueOf()
      && newTask.expectedReviewAt?.valueOf() === task.expectedReviewAt?.valueOf()
      && newTask.expectedCompleteAt?.valueOf() === task.expectedCompleteAt?.valueOf()
    ) {
      return;
    }

    store.updateTask(task.id, newTask);

    playUpdatedAnim();
    setTimeout(() => (
      containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' })
    ), 10);
  }

  const updateExpectedDate = (date: Date | undefined) => {
    if (task.status === 2) {
      if (date?.valueOf() === task.expectedReviewAt?.valueOf()) {
        return;
      }

      const newTask = {
        ...task,
        expectedReviewAt: date,
      };
      store.updateTask(task.id, newTask);
    };

    if (task.status === 3) {
      if (date?.valueOf() === task.expectedCompleteAt?.valueOf()) {
        return;
      }

      const newTask = {
        ...task,
        expectedCompleteAt: date,
      };
      store.updateTask(task.id, newTask);
    };

    playUpdatedAnim();
    setTimeout(() => (
      containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' })
    ), 10);
  };

  const removeHandler = () => {
    setIsDying(true);
    setTimeout(() => {
      store.removeTask(task.id);
    }, 150);
  };

  // Menu
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuToggleButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(task);

  const menuToggleHandler = () => {
    if (isMenuOpen) {
      // 변경사항 적용
      updateTask(editingTask);
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      menuContainerRef.current?.focus();
    }
  };

  const cancelHandler = () => {
    // 변경사항 취소
    setEditingTask(task);
    setIsMenuOpen(false);
  };

  const menuBlurHandler = (e: React.FocusEvent<HTMLDivElement, Element>) => {
    if (
      !menuContainerRef.current?.contains(e.relatedTarget)
      && e.relatedTarget !== menuToggleButtonRef.current
      && e.relatedTarget !== cancelButtonRef.current
      && e.relatedTarget !== removeButtonRef.current
    ) {
      setIsMenuOpen(false);
    }
  };

  // Move
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const moveToHandler = () => {
    if (!isMoveOpen) {
      setIsMoveOpen(true);
      stageContainerRef.current?.focus();
    }
  };

  const stageBlurHandler = (e: React.FocusEvent<HTMLDivElement, Element>) => {
    if (!stageContainerRef.current?.contains(e.relatedTarget)) {
      setIsMoveOpen(false);
    }
  };

  // Animations
  const [newAnimTimeoutID, setNewAnimTimeoutID] = useState<number>(0);
  const [updatedAnimTimeoutID, setUpdatedAnimTimeoutID] = useState<number>(0);
  const [isDying, setIsDying] = useState(false);

  const playUpdatedAnim = () => {
    if (updatedAnimTimeoutID > 0) {
      clearTimeout(updatedAnimTimeoutID);
    }
    setUpdatedAnimTimeoutID(setTimeout(() => {
      setUpdatedAnimTimeoutID(0);
    }, 1000));
  };

  useEffect(() => {
    if (isMoved) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playUpdatedAnim();
    }
  }, [isMoved]);

  const playNewAnim = () => {
    if (newAnimTimeoutID > 0) {
      clearTimeout(newAnimTimeoutID);
    }
    setNewAnimTimeoutID(setTimeout(() => {
      setNewAnimTimeoutID(0);
    }, 1000));
  };

  useEffect(() => {
    if (isNew) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playNewAnim();
    }
  }, [isNew]);

  return (
    <Wrapper
      $isMenuOpen={isMenuOpen}
      $isDying={isDying}
    >
      <Container
        ref={containerRef}
        $isNew={newAnimTimeoutID > 0}
        $isUpdated={updatedAnimTimeoutID > 0}
        $isDying={isDying}
      >
        <div>{task.title}</div>
        {
          (task.status === 2 || task.status === 3) &&
          <DateInput
            defaultDate={
              task.status === 2
                ? task.expectedReviewAt
                : task.status === 3
                  ? task.expectedCompleteAt
                  : undefined
            }
            onConfirmDate={updateExpectedDate}
          />
        }
        {/* ============================= 단계 이동 버튼 ============================= */}
        <MoveContainer>
          <MoveToButton
            onClick={moveToHandler}
            $isOpen={isMoveOpen}
          >
            <MoreIcon />
          </MoveToButton>
          <StageContainer
            ref={stageContainerRef}
            $isOpen={isMoveOpen}
            tabIndex={0}
            onBlur={stageBlurHandler}
          >
            {stageNames.map((stage, i) => (
              <StageButton
                key={i}
                onClick={() => moveHandler(i)}
                $isCurrent={task.status === i}
                disabled={task.status === i}
              >
                {stage}
              </StageButton>
            ))}
          </StageContainer>
          <MoveButton
            disabled={task.status === 4}
            onClick={() => moveHandler(task.status + 1)}
          >
            <StepIcon />
          </MoveButton>
        </MoveContainer>

        {/* ============================= 일정 상세 메뉴 ============================= */}
        <MenuContainer
          ref={menuContainerRef}
          $isOpen={isMenuOpen}
          tabIndex={0}
          onBlur={menuBlurHandler}
        >
          {/* DEBUG */}
          {isMenuOpen &&
            <DateInput
              defaultDate={task.createdAt}
              onConfirmDate={(date) => setEditingTask({
                ...editingTask,
                createdAt: date,
              })}
              onEnterDown={(date) => {
                const newTask: Task = {
                  ...editingTask,
                  createdAt: date,
                };
                setEditingTask(newTask);
                updateTask(newTask);
                setIsMenuOpen(false);
              }}
            />
          }
          <div style={{ fontSize: '0.5rem' }}>ID: {task.id}</div>
          <div style={{ fontSize: '0.5rem' }}>Title: {task.title}</div>
          <div style={{ fontSize: '0.5rem' }}>Link: {task.link}</div>
          <div style={{ fontSize: '0.5rem' }}>Status: {task.status}</div>
          <div style={{ fontSize: '0.5rem' }}>Created At: {task.createdAt?.toLocaleString('ko-KR')}</div>
          <div style={{ fontSize: '0.5rem' }}>Planned At: {task.plannedAt?.toLocaleString('ko-KR')}</div>
          <div style={{ fontSize: '0.5rem' }}>Started At: {task.startedAt?.toLocaleString('ko-KR')}</div>
          <div style={{ fontSize: '0.5rem' }}>Reviewed At: {task.reviewedAt?.toLocaleString('ko-KR')}</div>
          <div style={{ fontSize: '0.5rem' }}>Completed At: {task.completedAt?.toLocaleString('ko-KR')}</div>
          {task.status === 2 && <div style={{ fontSize: '0.5rem' }}>Expected: {task.expectedReviewAt?.toLocaleString('ko-KR')}</div>}
          {task.status === 3 && <div style={{ fontSize: '0.5rem' }}>Expected: {task.expectedCompleteAt?.toLocaleString('ko-KR')}</div>}
          {/* DEBUG */}
          <ColorOptionsContainer>
            {colors.map((color, idx) => (
              <ColorOption
                key={idx}
                onClick={() => setEditingTask({
                  ...editingTask,
                  colorIdx: idx,
                })}
                $color={color}
                $isSelected={idx === editingTask.colorIdx}
              >

              </ColorOption>
            ))}
          </ColorOptionsContainer>
        </MenuContainer>
        <RemoveButton
          ref={removeButtonRef}
          onClick={removeHandler}
          $isActive={isMenuOpen}
        >
          <RemoveIcon />
        </RemoveButton>
        <CancelButton
          ref={cancelButtonRef}
          onClick={cancelHandler}
          $isActive={isMenuOpen}
        >
          <CancelIcon />
        </CancelButton>
        <MenuToggleButton
          ref={menuToggleButtonRef}
          onClick={menuToggleHandler}
          $isActive={isMenuOpen}
        >
          {isMenuOpen
            ? <ConfirmIcon />
            : <MenuIcon />
          }
        </MenuToggleButton>
      </Container>
      <ColorTag className="color-tag" $color={colors[task.colorIdx]} />
    </Wrapper>
  );
}

const Wrapper = styled.div<{
  $isMenuOpen?: boolean,
  $isDying?: boolean,
}>`
  position: relative;

  width: 100%;
  /* height: 100px; */
  padding: 5px;

  height: ${({ $isMenuOpen }) => $isMenuOpen
    ? '200px'
    : '60px'
  };
  transition: height 0.1s ease-in-out;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: none;

  animation: ${({ $isDying }) => $isDying
    ? 'wrapperDyingAnim 0.2s ease-in-out'
    : 'none'};

  @keyframes wrapperDyingAnim {
    100% {
      height: 0px;
    }
  }
`;

const Container = styled.div<{
  $isNew?: boolean,
  $isUpdated?: boolean,
  $isDying?: boolean,
}>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  overflow: hidden;

  /* padding: 10px; */
  /* padding-left: 38px; */
  padding: 5px 5px 5px 38px;
  box-shadow: 0 0 3px #9e9e9e;

  border-radius: 10px;

  background-color: ${({ $isNew, $isUpdated }) => $isNew
    ? '#88ec88'
    : $isUpdated
      ? '#6fcdec'
      : '#ffffff'
  };
  transition: background-color 0.3s ease-in-out;

  animation: ${({ $isNew, $isUpdated, $isDying }) => {
    if ($isUpdated) {
      return 'updatedAnim 0.2s ease-in-out';
    } else if ($isNew) {
      return 'newAnim 0.2s ease-in-out';
    } else if ($isDying) {
      return 'containerDyingAnim 0.2s ease-in-out';
    } else {
      return 'none';
    }
  }};

  @keyframes updatedAnim {
    0% {
      transform: translateY(0);
    }
    20% {
      transform: translateY(-8px);
    }
    40% {
      transform: translateY(6px);
    }
    60% {
      transform: translateY(-4px);
    }
    80% {
      transform: translateY(2px);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes newAnim {
    0% {
      transform: scale(0);
    }
    80% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes containerDyingAnim {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }

  &:hover {
    filter: brightness(98%);
  }

  &:hover ~ .color-tag {
    height: calc(95% - 20px);
  }
`;

const ColorTag = styled.div<{ $color: string }>`
  width: 4px;
  /* height: 40px; */
  height: calc(42% - 10px);
  transition: height 0.1s ease-in-out;

  border-radius: 2px;

  position: absolute;
  top: 50%;
  /* left: calc(2.5% - 3px); */
  left: 2px;
  transform: translateY(-50%);

  background-color: ${({ $color }) => $color};
`;

const MoveContainer = styled.div`
  width: auto;
  height: 30px;

  position: absolute;
  right: 10px;
  bottom: 10px;

  display: flex;
  flex-direction: row;
`;

const StageContainer = styled.div<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => $isOpen
    ? '75px'
    : '0'
  };
  max-width: 'calc(100% - 108px)';
  transition: width 0.2s ease-in-out;
  height: 30px;

  display: flex;
  flex-direction: row;

  overflow: hidden;

  background-color: blue;
`;

const StageButton = styled.button<{ $isCurrent: boolean }>`
  width: 15px;

  &:disabled {
    background-color: red;
  }
`;

const Button = styled.button`
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #ffffff;
  border: 1px solid #d8d8d8;

  &:disabled {
    background-color: #e8e8e8;
  }

  &:not([disabled]):hover {
    background-color: #F7F7F9;
  }
`;

const MoveButton = styled(Button)`
  width: 40px;
  height: 30px;

  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;

  &:not([disabled]):hover {
    padding-right: 0;
  }
`;

const MoveToButton = styled(Button) <{ $isOpen: boolean }>`
  width: 20px;
  height: 30px;

  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;

  border-right: none;
  padding-right: 0;
`;

// scrap this /////////////////////////////////////////////////////////////
const MenuContainer = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  height: 100%;
  
  position: absolute;
  top: ${({ $isOpen }) => $isOpen
    ? '0'
    : '-100%'
  };
  transition: top 0.1s ease-in-out;
  left: 0;

  padding: 10px;
  padding-left: 38px;

  /* display: flex;
  align-items: center;
  justify-content: center; */
  overflow: hidden;

  background-color: gold; // debug

  &:focus {
    background-color: orange; // debug
  }
`;

const MenuButton = styled.button<{ $isActive: boolean }>`
  width: 22px;
  height: 22px;

  display: flex;

  align-items: center;
  justify-content: center;

  position: absolute;
  translate: -50% -50%;

  border-radius: 30%;

  border: none;

  box-shadow: 0 0 2px #9e9e9e;
`;

const MenuToggleButton = styled(MenuButton)`
  top: 19px;
  left: 19px;

  background-color: #F7F7F9;

  transition: transform 50ms ease-in-out;

  &:hover {
    background-color: #DBDBDD;
  }
  /* &:hover {
    background-color: ${({ $isActive }) => $isActive
    ? '#bae0bc'
    : '#DBDBDD'
  };
  } */
`;

const CancelButton = styled(MenuButton)`
  /* top: 49px; */
  top: ${({ $isActive }) => $isActive
    ? '49px'
    : '19px'
  };
  transition: top 0.1s ease-in-out;
  left: 19px;

  transform: ${({ $isActive }) => !$isActive && 'scale(0.5)'};

  background-color: #F7F7F9;

  &:hover {
    background-color: #DBDBDD;
  }

  /* &:hover {
    background-color: #f5cdcd;
  } */
`;

const RemoveButton = styled(MenuButton)`
  /* top: 79px; */
  top: ${({ $isActive }) => $isActive
    ? '79px'
    : '19px'
  };
  transition: top 0.1s ease-in-out;
  left: 19px;

  transform: ${({ $isActive }) => !$isActive && 'scale(0.5)'};

  background-color: #F7F7F9;

  &:hover {
    background-color: #f5cdcd;
  }
`;

const ColorOptionsContainer = styled.div`
  width: 90%;
  height: 30px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  background-color: gray;
`;

const ColorOption = styled.div<{
  $color: string,
  $isSelected: boolean,
}>`
  width: 20px;
  height: 20px;

  border-radius: 20%;

  // TODO: border style for CURRENT, SELECTED, OTHER
  border: ${({ $isSelected }) => $isSelected
    ? '3px solid black;'
    : '1px solid black;'
  };

  background-color: ${({ $color }) => $color};

  &:hover {
    border-width: 2px;
  }
`;

export default TaskCard;