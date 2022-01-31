const express = require("express");
const app = new express();

const morgan = require('morgan');
app.use(morgan('dev'));

/*This tells the server to use the client folder for all static resources*/
app.use(express.static("client"));

/*This tells the server to allow cross origin references*/
const cors_app = require("cors");
app.use(cors_app());

/*Uncomment the following lines to loan the environment variables that you set up in the .env file*/
const dotenv = require("dotenv");
dotenv.config();

const api_key = process.env.API_KEY;
const api_url = process.env.API_URL;
const PORT = process.env.PORT || 8080;

function getNLUInstance() {
  /**
   * Type the code to create the NLU instance and return it.
   *You can refer to the image in the instructions document to do the same.
   **/
  const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1");
  const { IamAuthenticator } = require("ibm-watson/auth");

  const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: "2021-08-01",
    authenticator: new IamAuthenticator({
      apikey: api_key,
    }),
    serviceUrl: api_url,
  });

  return naturalLanguageUnderstanding;
}

const fetchNLU = async (res, category, analyzeParams) => {
  const naturalLanguageUnderstanding = getNLUInstance();

  try {
    const analysisResults = await naturalLanguageUnderstanding.analyze(
      analyzeParams
    );

    if (analysisResults.status === 200) {
      return res.send(analysisResults.result.keywords[0][category], null, 2);
    }
  } catch (err) {
    res.status(err.code);
    return res.send(err);
  }
};

//The default endpoint for the webserver
app.get("/", (req, res) => {
  res.render("index.html");
});

//The endpoint for the webserver ending with /url/emotion
app.get("/url/emotion", (req, res) => {
  let urlToAnalyze = req.query.url;
  const analyzeParams = {
    url: urlToAnalyze,
    features: {
      keywords: {
        emotion: true,
        limit: 1,
      },
    },
  };

  fetchNLU(res, "emotion", analyzeParams);
});

//The endpoint for the webserver ending with /url/sentiment
app.get("/url/sentiment", (req, res) => {
  let urlToAnalyze = req.query.url;
  const analyzeParams = {
    url: urlToAnalyze,
    features: {
      keywords: {
        sentiment: true,
        limit: 1,
      },
    },
  };

  fetchNLU(res, "sentiment", analyzeParams);
});

//The endpoint for the webserver ending with /text/emotion
app.get("/text/emotion", (req, res) => {
  let textToAnalyze = req.query.text;
  console.log("Emotion: ", textToAnalyze)
  const analyzeParams = {
    text: textToAnalyze,
    features: {
      keywords: {
        emotion: true,
        limit: 1,
      },
    },
  };

  fetchNLU(res, "emotion", analyzeParams);
});

app.get("/text/sentiment", (req, res) => {
  let textToAnalyze = req.query.text;
  console.log("Sentiment: ", textToAnalyze)
  const analyzeParams = {
    text: textToAnalyze,
    features: {
      keywords: {
        sentiment: true,
        limit: 1,
      },
    },
  };

  fetchNLU(res, "sentiment", analyzeParams);
});

let server = app.listen(PORT, () => {
  console.log("Listening: ", server.address().port);
});
