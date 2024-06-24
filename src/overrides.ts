// extending String

String.prototype.splice = function (start, delCount, newSubStr = "") {
  return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};
String.prototype.stripDollarSign = function () {
  return this.replace("$", "");
};
String.prototype.stripDecimalSign = function () {
  return this.replace(/,|\./g, "");
};
String.prototype.addDollarBack = function () {
  if (this.indexOf("$") === -1) return "$" + this;
  else return this.toString();
};
String.prototype.addSeparators = function () {
  const decimals = this.slice(this.length - 2);
  const nonDecimal = this.slice(0, this.length - 2).replace(/[.,$]/g, "");
  let res = "";
  let c = 0;
  for (let i = nonDecimal.length - 1; i > -1; i--) {
    const char = nonDecimal[i];
    const addRightSeparator = c % 3 === 0 && c > 0;
    c++;

    console.log({ char, addRightSeparator, decimals });

    if (addRightSeparator) {
      res = `${char}.${res}`;
    } else {
      res = `${char}${res}`;
    }
  }
  console.log("::nonDecimal", { nonDecimal, res });
  // if (this.indexOf("$") === -1) return "$" + this;
  return `$${res},${decimals}`;
};
String.prototype.addDecimalBack = function () {
  if (this.indexOf(",") === -1) return this.splice(this.length - 2, 0, ",");
  else return this.toString();
};
String.prototype.pop = function () {
  return this.slice(0, this.length - 1);
};
String.prototype.padZeroes = function () {
  let copy = this.slice();
  while (copy.length < 3) {
    copy = "0" + copy;
  }
  return copy;
};
String.prototype.removeNonDigits = function () {
  return this.replace(/\D/g, "");
};
