import { useRef } from "react";
import styled from "styled-components";
import useStore, { Task } from "./useStore";
import { useEffect, useState } from "react";
import DateInput from "./DateInput";
import { MenuIcon, TrashIcon } from "./Icons";
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

  const moveHandler = (delta: number) => {
    const newStatus = task.status + delta;
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
    setTimeout(() =>
      containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' })
      , 10);
  };

  // const updateHandler = () => {
  //   const newTask = task;
  //   store.updateTask(task.id, newTask);
  // };

  const removeHandler = () => {
    setIsDying(true);
    setTimeout(() => {
      store.removeTask(task.id);
    }, 150);
  };

  // Menu
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuButtonHandler = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      menuContainerRef.current?.focus();
    }
  };

  const menuBlurHandler = (e: React.FocusEvent<HTMLDivElement, Element>) => {
    if (!menuContainerRef.current?.contains(e.relatedTarget)
      && e.relatedTarget !== menuButtonRef.current) {
      setIsMenuOpen(false);
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
    <Wrapper $isDying={isDying}>
      <Container
        ref={containerRef}
        $isNew={newAnimTimeoutID > 0}
        $isUpdated={updatedAnimTimeoutID > 0}
        $isDying={isDying}
      >
        {/* DEBUG */}
        {/* <h1>{isMoved ? 'true' : 'false'}</h1>
        <div>ID: {task.id}</div> */}
        <div>Title: {task.title}</div>
        {/* <div>Link: {task.link}</div>
        <div>Status: {task.status}</div>
        <div>Created At: {task.createdAt?.toLocaleString('ko-KR')}</div>
        <div>Planned At: {task.plannedAt?.toLocaleString('ko-KR')}</div>
        <div>Started At: {task.startedAt?.toLocaleString('ko-KR')}</div>
        <div>Reviewed At: {task.reviewedAt?.toLocaleString('ko-KR')}</div>
        <div>Completed At: {task.completedAt?.toLocaleString('ko-KR')}</div>
        {task.status === 2 && <div>Expected: {task.expectedReviewAt?.toLocaleString('ko-KR')}</div>}
        {task.status === 3 && <div>Expected: {task.expectedCompleteAt?.toLocaleString('ko-KR')}</div>} */}
        {/* DEBUG */}
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
        {/* 
      상위로 하나 더 묶어서 onFocus 관리
      <DetailButton> 
      <DetailModalBoundingBox /> 위 아래 여백 따라 방향 맞추기
       */}
        <ButtonContainer>
          <MoveButton disabled={task.status === 0} onClick={() => moveHandler(-1)}>left</MoveButton>
          {/*
        상위로 하나 더 묶어서 MoveToButton과 함께 onFocus 관리
        <MoveToModalBoundingBox /> size change, overflow hidden
        <MoveToModalContainer /> 버튼 5개, 현재 스테이지 비활성화

        */}
          <MoveToButton>move to</MoveToButton>
          <MoveButton disabled={task.status === 4} onClick={() => moveHandler(1)}>right</MoveButton>
        </ButtonContainer>

        <MenuContainer
          ref={menuContainerRef}
          $isOpen={isMenuOpen}
          tabIndex={0}
          onBlur={menuBlurHandler}
        >
          <RemoveButton className="remove-button" onClick={removeHandler}>
            <TrashIcon />
          </RemoveButton>
        </MenuContainer>
        <MenuButton
          ref={menuButtonRef}
          onClick={menuButtonHandler}
        >
          <MenuIcon />
        </MenuButton>
      </Container>
      <ColorTag className="color-tag" $color={colors[task.colorIdx]} />
    </Wrapper>
  );
}

const Wrapper = styled.div<{ $isDying?: boolean }>`
  position: relative;

  width: 100%;
  height: 100px;

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
    0% {
      height: 100px;
    }
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
  width: 95%;
  height: 95%;

  overflow: hidden;

  padding: 10px;
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
      return 'updatedAnim 0.1s ease-in-out';
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
    40% {
      transform: translateY(-10px);
    }
    90% {
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

  /* &:hover .color-tag {
    height: calc(100% - 20px);
  } */
  &:hover ~ .color-tag {
    height: calc(95% - 20px);
  }
`;

const ColorTag = styled.div<{ $color: string }>`
  width: 4px;
  height: 50%;
  transition: height 0.1s ease-in-out;

  border-radius: 2px;

  position: absolute;
  top: 50%;
  left: 1.3%;
  transform: translateY(-50%);

  background-color: ${({ $color }) => $color};
`;

// const ColorTag = styled.div<{ $color: string }>`
//   width: 4px;
//   height: calc(50% - 10px);
//   transition: height 0.1s ease-in-out;

//   border-radius: 2px;

//   position: absolute;
//   top: 50%;
//   left: -3px;
//   transform: translateY(-50%);

//   background-color: ${({ $color }) => $color};
// `;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Button = styled.button`
  width: auto;
`;

const MoveButton = styled(Button)`
  /* flex: 5; */
`;

const MoveToButton = styled(Button)`
  /* flex: 1; */
`;

const MenuButton = styled(Button)`
  display: flex;

  width: 22px;
  height: 22px;

  align-items: center;
  justify-content: center;

  position: absolute;
  top: 19px;
  right: 19px;
  translate: 50% -50%;

  border-radius: 30%;

  border: none;

  box-shadow: 0 0 2px #9e9e9e;

  background-color: #F7F7F9;

  transition: transform 50ms ease-in-out;
  &:hover {
    background-color: #DBDBDD;
    transform: scale(1.2);
  }
`;

const MenuContainer = styled.div<{ $isOpen: boolean }>`
  /* width: 30px;
  height: 30px; */
  /* aspect-ratio: 1 / 1; */
  width: ${({ $isOpen }) => $isOpen
    ? '250%'
    : '0'
  };
  height: ${({ $isOpen }) => $isOpen
    ? '500%'
    : '0'
  };
  border-radius: 50%;
  transition: width 0.1s ease-in-out, height 0.1s ease-in-out;
  
  position: absolute;
  top: 19px;
  right: 19px;
  translate: 50% -50%;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  background-color: gold; // debug

  &:focus {
    background-color: orange; // debug
  }
`;

const RemoveButton = styled(Button)`
  display: flex;

  width: 22px;
  height: 22px;

  align-items: center;
  justify-content: center;

  position: absolute;
  /* top: 19px; */
  /* right: 19px; */
  /* translate: 50% -50%; */
  translate: 0 32px;
  

  border-radius: 30%;

  border: none;

  box-shadow: 0 0 2px #9e9e9e;

  background-color: #F7F7F9;

  transition: transform 50ms ease-in-out;
  &:hover {
    background-color: #f5cdcd;
  }
`;

export default TaskCard;