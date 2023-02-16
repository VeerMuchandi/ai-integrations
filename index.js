
const express = require("express");
const cors = require("cors");
//require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.json());

app.post("/answer", async (req,res) => {

  var prompt = req.body.prompt||'';
  var temperature = req.body.temperature||0.5; //between 0 and 1
  var max_tokens = req.body.tokens||5; //between 5 and 2048
  const response_type = req.body.type||'';
  const apikey = req.body.apikey;

  const configuration = new Configuration({
      apiKey: apikey,
  });
  const openai = new OpenAIApi(configuration);

  if (prompt.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid prompt",
      }
    });
    return;
  }

  if (temperature < 0 || temperature > 1) {
    temperature = 0.5;
  }

  if (max_tokens > 2048) {
    max_tokens = 2048;
  }

  if (max_tokens < 5) {
    max_tokens = 5;
  }


  var qualified_prompt="";
  switch (response_type) {
    case 'essay':
      qualified_prompt = generateEssayPrompt(prompt);
      break;
    default:
      qualified_prompt = prompt;
  }

  console.log(qualified_prompt, temperature, max_tokens);

  try {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: qualified_prompt ,
        temperature: temperature,
        max_tokens: max_tokens,
      });   
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }});
    }
  }
});


app.listen(3000, () => console.log("API Server is running..."));

function generateEssayPrompt(prompt) {

  return `Write an essay on topic ${prompt} :`;

}

