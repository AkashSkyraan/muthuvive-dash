export const preventInvalidSpaces = (e) => {
  if (e.key === " " && e.currentTarget.value.length === 0) {
    e.preventDefault();
    return;
  }

  if (
    e.key === " " &&
    e.currentTarget.value.length > 0 &&
    e.currentTarget.value.endsWith(" ")
  ) {
    e.preventDefault();
  }
};
