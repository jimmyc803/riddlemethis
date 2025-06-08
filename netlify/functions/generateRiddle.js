const { Configuration, OpenAIApi } = require("openai");
const { createClient } = require("@supabase/supabase-js");

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function () {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Generate an original riddle suitable for all ages. Output in JSON:
  {
    "question": "...",
    "answer": "..."
  }`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const content = completion.data.choices[0].message.content;
    const { question, answer } = JSON.parse(content);

    await supabase.from("riddles").upsert({
      question,
      answer,
      date: today,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, question }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
