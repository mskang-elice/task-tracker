import { useRef } from "react";
import styled from "styled-components";
import useStore, { Task } from "./useStore";
import { useEffect, useState } from "react";
import DateInput from "./DateInput";
import { RemoveIcon } from "./Icons";

interface Props {
  task: Task;
  isNew?: boolean;
  isMoved?: boolean;
  onMove?: () => void;
};

function TaskCard({ task, isNew, isMoved, onMove }: Props) {
  const store = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [newAnimTimeoutID, setNewAnimTimeoutID] = useState<number>(0);
  const [updatedAnimTimeoutID, setUpdatedAnimTimeoutID] = useState<number>(0);

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
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playUpdatedAnim();
    };

    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playUpdatedAnim();
  };

  const removeHandler = () => {
    store.removeTask(task.id);
  };

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
    <Frame>
      <Container ref={containerRef} $isNew={newAnimTimeoutID > 0} $isUpdated={updatedAnimTimeoutID > 0}>
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
        <RemoveButton className="remove-button" onClick={removeHandler}>
          <RemoveIcon />
        </RemoveButton>
      </Container>
    </Frame>
  );
}

const Frame = styled.div`
  width: 100%;
  height: 100px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: none;
`;

const Container = styled.div<{ $isNew?: boolean, $isUpdated?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 95%;
  height: 95%;

  padding: 5px;
  box-shadow: 10;

  border-radius: 10px;

  background-color: ${({ $isNew }) => $isNew
    ? '#88ec88'
    : '#add8e6'
  };
  transition: background-color 0.3s ease-in-out;

  animation: ${({ $isNew, $isUpdated }) => $isUpdated
    ? 'updatedAnim 0.1s ease-in-out'
    : $isNew
      ? 'newAnim 0.2s ease-in-out'
      : 'none'};

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

  &:hover {
    filter: brightness(105%);
  }

  &:hover .remove-button {
    display: flex;
  }
`;

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

const RemoveButton = styled(Button)`
  display: none;

  width: 18px;
  height: 18px;

  align-items: center;
  justify-content: center;

  position: absolute;
  top: 4px;
  right: 4px;

  border-radius: 30%;
  
  border: none;

  &:hover {
    background-color: #ff9999;
  }
`;

export default TaskCard;