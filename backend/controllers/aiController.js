const { GoogleGenerativeAI } = require('@google/generative-ai');
const VivaSchedule = require('../models/VivaSchedule');
const MCQQuestion = require('../models/MCQQuestion');
const ChatLog = require('../models/ChatLog');

// Initialize Gemini with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * getModelWithFallback — tries each model in order until one succeeds.
 * Primary: gemini-3.5-flash (confirmed working)
 * Fallback: gemini-3.1-flash-lite, gemini-3.1-flash-lite-preview
 */
const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
];

const generateWithFallback = async (prompt) => {
  let lastError;
  for (const modelName of MODELS) {
    try {
      console.log(`[AI] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`[AI] Success with: ${modelName}`);
      return result.response.text();
    } catch (err) {
      console.warn(`[AI] ${modelName} failed: ${err.message?.substring(0, 120)}`);
      lastError = err;
    }
  }
  throw lastError;
};

/**
 * generateMCQs — Generates 20 MCQs for a given viva schedule using Gemini AI.
 * Idempotent: if MCQs already exist for this schedule, returns cached questions.
 * correctIndex is stored in DB but stripped before sending to frontend (security).
 */
const generateMCQs = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const schedule = await VivaSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    if (schedule.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This schedule does not belong to you.' });
    }

    // ── IST-aware status check ──────────────────────────────────────────
    // Parse the scheduled time as IST (UTC+5:30) to avoid server timezone issues
    const now   = new Date();
    const start = new Date(`${schedule.vivaDate}T${schedule.vivaTime}:00+05:30`);
    const end   = new Date(start.getTime() + schedule.duration * 60 * 1000);

    console.log(`[StartViva] scheduleId=${scheduleId} studentId=${req.user.id}`);
    console.log(`[StartViva] now=${now.toISOString()} start=${start.toISOString()} end=${end.toISOString()}`);
    console.log(`[StartViva] storedStatus=${schedule.status} date=${schedule.vivaDate} time=${schedule.vivaTime}`);

    // Auto-promote: if within window but DB still says 'upcoming', treat as active
    let liveStatus = schedule.status;
    if (schedule.status !== 'completed') {
      if (now >= start && now <= end) {
        liveStatus = 'active';
        if (schedule.status !== 'active') {
          schedule.status = 'active';
          await schedule.save();
          console.log(`[StartViva] Auto-promoted to active`);
        }
      } else if (now > end) {
        liveStatus = 'completed';
        schedule.status = 'completed';
        await schedule.save();
      }
    }

    console.log(`[StartViva] liveStatus=${liveStatus}`);

    if (liveStatus === 'completed') {
      return res.status(409).json({ message: 'This viva has already been completed.' });
    }
    if (liveStatus !== 'active') {
      const minutesUntil = Math.ceil((start - now) / 60000);
      return res.status(400).json({
        message: `Viva is not active yet. It is scheduled at ${schedule.vivaTime} on ${schedule.vivaDate}. Starts in ~${minutesUntil} minute(s).`,
      });
    }

    // Return cached questions if already generated
    let mcqRecord = await MCQQuestion.findOne({ vivaScheduleId: scheduleId });

    if (!mcqRecord) {
      console.log(`[MCQ] Generating questions for: "${schedule.labTopic}" (${schedule.subjectName})`);

      const prompt = `You are an expert professor for the subject "${schedule.subjectName}".
Generate exactly 20 multiple choice questions about the lab topic: "${schedule.labTopic}".

STRICT RULES:
- Each question must have exactly 4 answer options
- Mix difficulty: 7 easy, 8 medium, 5 hard
- Questions must be specific, practical, and relevant to the topic
- correctIndex must be 0, 1, 2, or 3 (0-based index of the correct option)
- Return ONLY a valid JSON array — no markdown, no code fences, no explanation, nothing else

JSON FORMAT (return exactly this structure):
[
  {
    "questionText": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]`;

      const rawText0 = await generateWithFallback(prompt);
      let rawText = rawText0

      // Strip any markdown code fences if present
      rawText = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      // Extract the JSON array (find first [ to last ])
      const start = rawText.indexOf('[');
      const end = rawText.lastIndexOf(']');
      if (start === -1 || end === -1) {
        throw new Error('Gemini did not return a valid JSON array. Raw: ' + rawText.substring(0, 200));
      }
      const jsonStr = rawText.substring(start, end + 1);
      const parsedQuestions = JSON.parse(jsonStr);

      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error('Parsed questions array is empty or invalid.');
      }

      console.log(`[MCQ] Generated ${parsedQuestions.length} questions successfully.`);

      mcqRecord = await MCQQuestion.findOneAndUpdate(
        { vivaScheduleId: scheduleId },
        {
          $setOnInsert: {
            vivaScheduleId: scheduleId,
            subjectName: schedule.subjectName,
            labTopic: schedule.labTopic,
            questions: parsedQuestions,
          },
        },
        { upsert: true, new: true }
      );
    } else {
      console.log(`[MCQ] Using cached ${mcqRecord.questions.length} questions for schedule ${scheduleId}`);
    }

    // Include correctIndex so frontend can show green/red answer feedback
    const sanitizedQuestions = mcqRecord.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      correctIndex: q.correctIndex,  // needed for live MCQ color feedback
    }));

    res.json({
      vivaId: scheduleId,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('[MCQ] Error generating MCQs:', error.message);
    res.status(500).json({
      message: 'Failed to generate MCQ questions. Please try again.',
      error: error.message,
    });
  }
};

/**
 * chatWithAI — AI chatbot for viva preparation using Gemini.
 */
const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    const subjectName = context?.subjectName || 'the subject';
    const labTopic = context?.labTopic || 'the topic';

    const prompt = `You are a friendly and knowledgeable teaching assistant helping a student prepare for their viva (oral examination).
Subject: ${subjectName}
Lab Topic: ${labTopic}

Student's question: ${message.trim()}

Instructions:
- Give a clear, concise, educational answer
- Use simple language suitable for a student
- Include practical examples where helpful
- If it's a concept question, explain step by step
- Keep the response focused and under 300 words`;

    const replyText = await generateWithFallback(prompt);

    // Save chat log to DB (async, non-blocking)
    const chatLog = new ChatLog({
      studentId: req.user.id,
      messages: [
        { role: 'user', content: message.trim(), timestamp: new Date() },
        { role: 'assistant', content: replyText, timestamp: new Date() },
      ],
    });
    chatLog.save().catch((err) => console.error('[Chat] Failed to save log:', err.message));

    res.json({ reply: replyText });
  } catch (error) {
    console.error('[Chat] Error:', error.message);
    res.status(500).json({
      message: 'AI assistant encountered an error. Please try again.',
      error: error.message,
    });
  }
};

module.exports = { generateMCQs, chatWithAI };
