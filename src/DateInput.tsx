import { useState } from "react";
import styled from "styled-components";
import Input from "./Input";

interface Props {
  defaultDate?: Date;
  onConfirmDate?: (date: Date | undefined) => void;
  onEnterDown?: (date: Date | undefined) => void; // State에서만 사용
};

const DateInput = ({ defaultDate, onConfirmDate, onEnterDown }: Props) => {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [displayText, setDisplayText] = useState(date2text(defaultDate));

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayText(e.target.value);
  };

  const onTextBlur = () => {
    const newDate = applyTextToDate(displayText);
    if (!newDate) {
      setDisplayText(date2text(date));
    } else {
      onConfirmDate?.(newDate);
    }
  };

  const applyTextToDate = (newText: string) => {
    if (newText === '') {
      setDate(undefined);
      return undefined;
    }

    const newDate = new Date(elongateYear(newText));

    if (isNaN(newDate.getTime())) {
      // 유효하지 않은 날짜 텍스트: 기존 date 값 반환
      return date;
    }

    if (newDate.getFullYear() === new Date('1/1').getFullYear()) {
      // 년도를 입력하지 않은 경우: 무조건 미래 시점으로 설정
      newDate.setFullYear(new Date().getFullYear());
      if (newDate.getTime() < new Date().getTime()) {
        newDate.setFullYear(new Date().getFullYear() + 1);
      }
    }

    setDate(newDate);
    setDisplayText(date2text(newDate));
    return newDate;
  };

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value ? new Date(e.target.value) : undefined;
    setDate(newDate);
    applyDateToText(newDate);
    onConfirmDate?.(newDate);
  };

  const applyDateToText = (newDate: Date | undefined) => {
    const newText = date2text(newDate);
    setDisplayText(newText);
    return newText;
  };

  const onTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onEnterDown) {
        // 즉시 생성해야 하므로 바로 처리
        const newDate = applyTextToDate(displayText);
        onEnterDown(newDate);
        e.currentTarget.blur();
        setDate(undefined);
        setDisplayText('');
      } else {
        e.currentTarget.blur();
      }
    };
  };

  const onDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onEnterDown) {
        onEnterDown(date);
        setDate(undefined);
        setDisplayText('');
      };
      e.currentTarget.blur();
    };
  };

  return (
    <Container>
      <StyledTextInput
        type="text"
        value={displayText}
        onChange={onTextChange}
        onBlur={onTextBlur}
        onKeyDown={onTextKeyDown}
      />
      <StyledDateInput
        type="date"
        value={date2value(date)}
        onChange={onDateChange}
        onKeyDown={onDateKeyDown}
      />
    </Container>
  );
};

const date2text = (date: Date | undefined) => {
  return (
    date
      ? `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}/${date.getDate()}`
      : ''
  );
};

const elongateYear = (text: string) => {
  const slashParts = text.split('/');
  if (slashParts.length === 3 && slashParts[0].length === 2) {
    // XX/XX/XX 형식인 경우
    return '20' + text;
  };

  const dashParts = text.split('-');
  if (dashParts.length === 3 && dashParts[0].length === 2) {
    // XX-XX-XX 형식인 경우
    return '20' + text;
  };

  return text;
};

const date2value = (date: Date | undefined) => {
  // Date 객체 -> date 타입 인풋 value
  // ISOString 시차 때문에 1일 보정
  if (!date) {
    return '';
  }

  const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return tempDate.toISOString().slice(0, 10);
};

const Container = styled.div`
  width: auto;
  height: 18px;

  display: flex;
  flex-direction: row;
  align-items: center;

  /* background-color: red; */
`;

const StyledTextInput = styled(Input)`
  width: 68px;

  text-align: center;
`;

const StyledDateInput = styled.input`
  width: 18px;
  height: 18px;

  border: none;
  border-radius: 50%;

  &:hover {
    box-shadow: 0 0 3px;
  }
`;

export default DateInput;