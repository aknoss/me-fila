const BASE62_CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE62_ID_LENGTH = 5;

export function generateBase62() {
  let id = "";
  for (let i = 0; i < BASE62_ID_LENGTH; i++) {
    id += BASE62_CHARSET.charAt(
      Math.floor(Math.random() * BASE62_CHARSET.length),
    );
  }
  return id;
}
