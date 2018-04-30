export const firebaseConfig = {
  apiKey: "MY-FIREBASE-API-KEY",
  authDomain: "MY-FIREBASE-DOMAIN",
  databaseURL: "https://MY-FIREBASE-PROJECTID.firebaseio.com",
  projectId: "MY-FIREBASE-PROJECTID",
  timestampsInSnapshots: true
};

const nlpAPIKey = "MY-API-KEY-GOES-HERE";
export const nlpAPIConfig = {
  uri:
    "https://language.googleapis.com/v1/documents:analyzeSentiment?key=" +
    nlpAPIKey
};

export const firestoreConfig = {
  timestampsInSnapshots: true
};
