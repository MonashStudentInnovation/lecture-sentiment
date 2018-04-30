import { nlpAPIConfig } from "./config";
export const analyseText = text => {
  return fetch(nlpAPIConfig.uri, {
    method: "POST",
    body: JSON.stringify({
      document: {
        content: text,
        type: "PLAIN_TEXT"
      }
    })
  })
    .then(resp => {
      return resp.json();
    })
    .then(sentiment => {
      return sentiment;
    });
};
