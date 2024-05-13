/* eslint-disable @typescript-eslint/no-explicit-any */
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
  (String.prototype as any).splice = function (start: number, delCount: number, newSubStr = "") {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };
  (String.prototype as any).stripDollarSign = function () {
    return this.replace("$", "");
  };
  (String.prototype as any).stripDecimalSign = function () {
    return this.replace(/,|\./g, "");
  };
  (String.prototype as any).addDollarBack = function () {
    if (this.indexOf("$") === -1) return "$" + this;
    else return this;
  };
  (String.prototype as any).addSeparators = function () {
    const decimals = this.slice(this.length - 2);
    const nonDecimal = this.slice(0, this.length - 2).replace(/[.,$]/g, "");
    let res = "";
    let c = 0;
    for (let i = nonDecimal.length - 1; i > -1; i--) {
      const char = nonDecimal[i];
      const addRightSeparator = c % 3 === 0 && c > 0;
      c++;

      // console.log({ char, addRightSeparator, decimals });

      if (addRightSeparator) {
        res = `${char}.${res}`;
      } else {
        res = `${char}${res}`;
      }
    }
    // console.log("::nonDecimal", { nonDecimal, res });
    return `$${res},${decimals}`;
  };
  (String.prototype as any).addDecimalBack = function () {
    if (this.indexOf(",") === -1) return this.splice(this.length - 2, 0, ",");
    else return this;
  };
  (String.prototype as any).pop = function () {
    return this.slice(0, this.length - 1);
  };
  (String.prototype as any).padZeroes = function () {
    let copy = this.slice();
    while (copy.length < 3) {
      copy = "0" + copy;
    }
    return copy;
  };
  (String.prototype as any).removeNonDigits = function () {
    return this.replace(/\D/g, "");
    // return this;
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const input = inputRef.current;

    const moves = [initialValue];
    let moveIdx = 0;

    let key = "";
    let sStart = 5;
    let sEnd = 5;

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

      let strVal = val.stripDollarSign().stripDecimalSign();

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
              let temp = val.splice(idx, 1).stripDollarSign().stripDecimalSign();
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

    function updateMoves(val: string) {
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
    }

    return () => {
      if (!input) return;

      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("keyup", onKeyUp);
    };
  }, [onChange]);

  return (
    <>
      <input ref={inputRef} type="text" defaultValue={initialValue} />
    </>
  );
}
