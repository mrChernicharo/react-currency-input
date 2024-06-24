import { useCallback, useEffect, useRef, useState } from "react";

export function App() {
  const initialValue = "$0,00";
  const [v, setV] = useState(initialValue);

  const onChange = useCallback((val: string) => {
    setV(val);
  }, []);

  return (
    <>
      <h1>Currency Input</h1>

      <CurrencyInput onChange={onChange} initialValue={initialValue} />

      <input type="text" />

      <div>{v}</div>
    </>
  );
}

function CurrencyInput({ initialValue = "", onChange }: { initialValue: string; onChange: (val: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const input = inputRef.current;

    const moves = [initialValue];
    let moveIdx = 0;

    let key = "";
    let sStart = 5;
    let sEnd = 5;

    const updateMoves = (val: string) => {
      if (moveIdx === moves.length - 1) {
        if (moves[moveIdx] !== val) {
          moves.push(val);
        }
      } else {
        moves.splice(moveIdx, moves.length - moveIdx + 1, val);
      }

      if (moves.length < 2) {
        moves.unshift(initialValue);
      }
      moveIdx = moves.length - 1;
      // console.log(moveIdx, moves);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      // console.log(":::keyup", e.target.selectionStart, e.target.selectionEnd, { el: e.target });
      sStart = (e.target as HTMLInputElement).selectionStart || 5;
      sEnd = (e.target as HTMLInputElement).selectionEnd || 5;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      key = e.key;
      const targetValue = (e.target as HTMLInputElement).value;
      const val = targetValue;
      // let numVal = Number(strVal);
      console.log({
        key,
        // sStart,
        // sEnd,
        // strVal,
        val,
        code: e.code,
        e,
      });

      let strVal = `${val}`.removeNonDigits();

      switch (true) {
        case key === "Tab":
        case key === "ArrowLeft" || key === "ArrowRight":
          break;
        case key === "Escape":
          break;
        case e.code === "KeyR" && (e.ctrlKey || e.metaKey):
          console.log("reload");
          break;
        case e.code === "KeyZ" && e.shiftKey && (e.ctrlKey || e.metaKey):
          e.preventDefault();
          console.log("redo!");
          if (moveIdx < moves.length - 1) moveIdx++;
          (e.target as HTMLInputElement).value = moves[moveIdx];
          break;
        case e.code === "KeyZ" && (e.ctrlKey || e.metaKey):
          e.preventDefault();
          console.log("undo!", moves, moveIdx, moves[moveIdx]);
          if (moveIdx > 0) moveIdx--;
          (e.target as HTMLInputElement).value = moves[moveIdx];
          break;
        case e.code === "KeyC" && (e.ctrlKey || e.metaKey):
          console.log("copy!");
          break;
        case e.code === "KeyV" && (e.ctrlKey || e.metaKey):
          console.log("paste!", e, targetValue);
          setTimeout(() => {
            (e.target as HTMLInputElement).value = targetValue
              .removeNonDigits()
              .padZeroes()
              .addDollarBack()
              .addDecimalBack()
              .addSeparators();

            updateMoves((e.target as HTMLInputElement).value);
          }, 60);
          break;
        case e.code === "KeyX" && (e.ctrlKey || e.metaKey):
          console.log("cut!", val);
          setTimeout(() => {
            (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value
              .stripDollarSign()
              .stripDecimalSign()
              .padZeroes()
              .addDollarBack()
              .addDecimalBack()
              .addSeparators();

            updateMoves((e.target as HTMLInputElement).value);
          }, 60);
          break;
        case key === "Backspace" && (e.ctrlKey || e.metaKey):
          e.preventDefault();
          (e.target as HTMLInputElement).value = initialValue;
          break;
        case key === "Backspace":
          e.preventDefault();

          // 1 char selection
          if (sEnd === sStart) {
            // cursor after last char
            if (sEnd === val.length) {
              // console.log("1 char, THE LAST");

              strVal = strVal.pop().padZeroes().addDollarBack().addDecimalBack();
            } else {
              // console.log("1 char, not last");
              const idx = [",", "."].includes(val[sStart - 1]) ? sStart - 2 : sStart - 1;
              const temp = val.splice(idx, 1).stripDollarSign().stripDecimalSign();
              // console.log(temp, idx, val[idx]);
              strVal = temp.padZeroes().addDollarBack().addDecimalBack();
            }
          }
          // more than 1 char selection
          else {
            // console.log("many chars!!!");
            const size = sEnd - sStart > 0 ? sEnd - sStart : 1;
            const temp = val.splice(sStart, size).stripDollarSign().stripDecimalSign().padZeroes();
            strVal = temp.addDollarBack().addDecimalBack().padZeroes();
          }

          (e.target as HTMLInputElement).value = strVal.addSeparators();
          updateMoves((e.target as HTMLInputElement).value);
          break;
        case /\d/.test(key):
          e.preventDefault();

          // 1 char selection
          if (sEnd === sStart) {
            // cursor after last char
            if (sEnd === val.length) {
              strVal += key;
            }
            // cursor elsewhere
            else if (sEnd !== val.length) {
              strVal = val.splice(sEnd, 0, key).stripDollarSign().stripDecimalSign();
            }

            if (strVal[0] === "0") strVal = strVal.slice(1); // remove trailing zero
          }
          // more than 1 char selection
          else {
            strVal = val
              .splice(sStart, sEnd - sStart, key)
              .stripDollarSign()
              .stripDecimalSign()
              .padZeroes();
          }

          strVal = strVal.addDollarBack().addDecimalBack();
          (e.target as HTMLInputElement).value = strVal.addSeparators();
          updateMoves((e.target as HTMLInputElement).value);
          break;
        default:
          e.preventDefault();
          break;
      }

      onChange((e.target as HTMLInputElement).value || initialValue);
    };

    input.addEventListener("keydown", onKeyDown);
    input.addEventListener("keyup", onKeyUp);

    return () => {
      if (!input) return;

      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("keyup", onKeyUp);
    };
  }, [initialValue, onChange]);

  return (
    <>
      <input ref={inputRef} type="text" defaultValue={initialValue} />
    </>
  );
}
