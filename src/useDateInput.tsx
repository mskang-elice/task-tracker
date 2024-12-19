import { useState } from "react";
import styled from "styled-components";

const date2text = (date: Date | undefined) => {
  return date ? `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}/${date.getDate()}` : '';
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
}

function useDateInput(defaultDate?: Date, onConfirmDate?: (date: Date | undefined) => void) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  // const [currentFocus, setCurrentFocus] = useState<"" | "text" | "date">("");
  // const isTextOnFocus = useRef<boolean>(false);

  const DateInput = () => {
    // const textInputRef = useRef<HTMLInputElement>(null);
    const [displayText, setDisplayText] = useState(date2text(defaultDate));

    const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayText(e.target.value);
    };

    const onTextBlur = () => {
      const newDate = applyTextToDate(displayText);
      console.log("onTextBlur"); ////////
      console.log(newDate);
      if (!newDate) {
        setDisplayText(date2text(date));
      };
    }

    const applyTextToDate = (newText: string) => {
      const newDate = new Date(elongateYear(newText));

      console.log("applyTextToDate"); /////
      console.log(newDate);

      if (isNaN(newDate.getTime())) {
        // 유효하지 않은 날짜 텍스트
        return undefined;
      }

      if (newDate.getFullYear() !== new Date('1/1').getFullYear()) {
        // 년도를 직접 입력한 경우
        setDate(newDate);
        return newDate;
      }

      newDate.setFullYear(new Date().getFullYear());
      // 년도를 입력하지 않은 경우: 무조건 미래 시점으로 설정
      if (newDate.getTime() < new Date().getTime()) {
        newDate.setFullYear(new Date().getFullYear() + 1);
      }
      setDate(newDate);
      return newDate;
    }

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

    return (
      <Container>
        <StyledTextInput
          // ref={textInputRef}
          type="text"
          value={displayText}
          onChange={onTextChange}
          onBlur={onTextBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // confirmInput();
              onTextBlur();
            }
          }}
        />
        <StyledDateInput
          type="date"
          value={date?.toISOString().slice(0, 10)}
          onChange={onDateChange}
          // onFocus={() => setCurrentFocus("date")}
          // onFocus={() => isTextOnFocus.current = false}
        />
      </Container>
    );
  };

  return {
    DateInput,
    date,
  };
}

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

export default useDateInput;

// import { useRef, useState } from "react";
// import styled from "styled-components";

// const date2text = (date: Date | undefined) => {
//   return date ? `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}/${date.getDate()}` : '';
// };

// function useDateInput(defaultDate?: Date, onConfirmDate?: (date: Date | undefined) => void) {
//   const [displayText, setDisplayText] = useState(date2text(defaultDate));
//   const [date, setDate] = useState<Date | undefined>(defaultDate);
//   // const [currentFocus, setCurrentFocus] = useState<"" | "text" | "date">("");
//   const isTextOnFocus = useRef<boolean>(false);

//   const DateInput = () => {
//     const containerRef = useRef<HTMLDivElement>(null);
//     const textInputRef = useRef<HTMLInputElement>(null);

//     const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       setDisplayText(e.target.value);
//     };

//     const applyTextToDate = (newText: string) => {
//       const newDate = new Date(newText);

//       if (isNaN(newDate.getTime())) {
//         // 유효하지 않은 날짜 텍스트
//         return undefined;
//       }

//       if (newDate.getFullYear() !== new Date('1/1').getFullYear()) {
//         // 년도를 직접 입력한 경우
//         setDate(newDate);
//         return newDate;
//       }

//       newDate.setFullYear(new Date().getFullYear());
//       // 년도를 입력하지 않은 경우: 무조건 미래 시점으로 설정
//       if (newDate.getTime() < new Date().getTime()) {
//         newDate.setFullYear(new Date().getFullYear() + 1);
//       }
//       setDate(newDate);
//       return newDate;
//     }

//     const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const newDate = new Date(e.target.value);
//       setDate(newDate);
//       applyDateToText(newDate);
//       onConfirmDate?.(newDate);
//     };

//     const applyDateToText = (newDate: Date | undefined) => {
//       const newText = date2text(newDate);
//       setDisplayText(newText);
//       return newText;
//     };

//     const confirmInput = () => {
//       // if (currentFocus === "text") {
//       // if (textInputRef.current?.onfocus) {
//       if (isTextOnFocus.current) {
//         const newDate = applyTextToDate(displayText);
//         onConfirmDate?.(newDate);
//       };
//     };

//     return (
//       <Container
//         ref={containerRef}
//         tabIndex={0}
//         onBlur={(e) => {
//           if (!containerRef.current?.contains(e.target)) {
//             confirmInput();
//             // setCurrentFocus("");
//             isTextOnFocus.current = false;
//           }
//         }}
//       // onKeyDown={(e) => {
//       //   if (e.key === 'Enter') {
//       //     confirmInput();
//       //   }
//       // }}
//       >
//         <StyledTextInput
//           ref={textInputRef}
//           type="text"
//           value={displayText}
//           onChange={onTextChange}
//           // onFocus={() => setCurrentFocus("text")}
//           onFocus={() => isTextOnFocus.current = true}
//         />
//         <StyledDateInput
//           type="date"
//           value={date?.toISOString().slice(0, 10)}
//           onChange={onDateChange}
//           // onFocus={() => setCurrentFocus("date")}
//           onFocus={() => isTextOnFocus.current = false}
//         />
//       </Container>
//     );
//   };

//   return {
//     DateInput,
//     date,
//     displayText,
//   };
// }

// const Container = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
// `;

// const StyledTextInput = styled.input`
//   width: 60px;
//   height: 20px;
// `;

// const StyledDateInput = styled.input`
//   width: 20px;
//   height: 20px;
// `;

// export default useDateInput;