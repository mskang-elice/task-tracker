import { useState } from "react";
import styled from "styled-components";

interface Props {
  defaultDate?: Date;
  // 아래 두 함수 중 하나만 사용해야 함
  onConfirmDate?: (date: Date | undefined) => void; // TaskCard에서
  onAddTask?: (date: Date | undefined) => void; // State에서
};

const DateInput = ({ defaultDate, onConfirmDate, onAddTask }: Props) => {
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

  // const confirmInput = () => {
  //   // if (currentFocus === "text") {
  //   // if (textInputRef.current?.onfocus) {
  //   if (isTextOnFocus.current) {
  //     const newDate = applyTextToDate(displayText);
  //     onConfirmDate?.(newDate);
  //   };
  // };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onAddTask) {
        // 즉시 생성해야 하므로 바로 처리
        const newDate = applyTextToDate(displayText);
        onAddTask(newDate);
        setDisplayText('');
        setDate(undefined);
      };
      e.currentTarget.blur();
    };
  };

  return (
    <Container>
      <StyledTextInput
        // ref={textInputRef}
        type="text"
        value={displayText}
        onChange={onTextChange}
        onBlur={onTextBlur}
        onKeyDown={onKeyDown}
      />
      <StyledDateInput
        type="date"
        value={date2value(date)}
        onChange={onDateChange}
      // onFocus={() => setCurrentFocus("date")}
      // onFocus={() => isTextOnFocus.current = false}
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



// import styled from "styled-components";

// interface Props {
//   value: Date | undefined;
//   setValue: (date: Date | undefined) => void;
// }

// function ExpectedInput({ value, setValue }: Props) {
//   return (
//     <DateInput
//       type="date"
//       value={value?.toISOString().slice(0, 10)}
//       onChange={(e) => setValue(new Date(e.target.value))}
//     />
//   );
// }

// const DateInput = styled.input`
//   width: 20px;
//   height: 20px;
// `;

// export default ExpectedInput;

// import { useState } from "react";
// import styled from "styled-components";

// interface Props {
//   value: Date | undefined;
//   setValue: (date: Date | undefined) => void;
// }

// function ExpectedInput({ value, setValue }: Props) {
//   // 예상 일자 입력
//   const [displayText, setDisplayText] = useState<string>(date2text(value));

//   const applyDateToText = (date: Date | undefined) => {
//     setDisplayText(date2text(date));
//   };

//   const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setDisplayText(e.target.value);
//     const date = new Date(e.target.value);
//     if (isNaN(date.getTime())) {
//       return;
//     }

//     if (date.getFullYear() !== new Date('1/1').getFullYear()) {
//       return;
//     }

//     date.setFullYear(new Date().getFullYear());
//     // 무조건 미래 시점으로 설정
//     if (date.getTime() < new Date().getTime()) {
//       date.setFullYear(new Date().getFullYear() + 1);
//     }
//     setValue(date);
//   };


//   const onTextBlur = () => {
//     applyDateToText(value);
//   };

//   const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const date = new Date(e.target.value);
//     setValue(date);
//     applyDateToText(date);
//   };

//   return (
//     <Container>
//       <TextInput type="text" value={displayText} onChange={onTextChange} onBlur={onTextBlur} />
//       <DateInput type="date" value={value?.toISOString().slice(0, 10)} onChange={onDateChange} />
//     </Container>
//   );
// }

// const date2text = (date: Date | undefined) => {
//   return date ? `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}/${date.getDate()}` : '';
// };

// const Container = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
// `;

// const TextInput = styled.input`
//   width: 60px;
//   height: 20px;
// `;

// const DateInput = styled.input`
//   width: 20px;
//   height: 20px;
// `;

// export default ExpectedInput;