import * as openai from "./openai";
import * as azure from "./azure";
import * as vertex from "./vertex";

const provider = process.env.AI_PROVIDER ?? "openai";

export function getProvider():
  | typeof openai
  | typeof azure
  | typeof vertex {
  switch (provider) {
    case "azure":
      return azure as typeof openai;
    case "vertex":
      return vertex as typeof openai;
    default:
      return openai;
  }
}

export { openai, azure, vertex };
