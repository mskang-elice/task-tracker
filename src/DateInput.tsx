import { useState } from "react";
import styled from "styled-components";

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
    const newDate = new Date(elongateYear(newText));

    if (isNaN(newDate.getTime())) {
      // 유효하지 않은 날짜 텍스트
      return undefined;
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
    const newDate = new Date(e.target.value);
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
      };
      e.currentTarget.blur();
    };
  };

  const onDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onEnterDown) {
        onEnterDown(date);
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
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledTextInput = styled.input`
  width: 60px;
  height: 20px;
`;

const StyledDateInput = styled.input`
  width: 20px;
  height: 20px;
`;

export default DateInput;