import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Generous payload limits for base64 image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Image Generation & Editing endpoint
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'A text prompt or instruction is required.' });
      return;
    }

    const ai = getGeminiClient();

    // Prepare contents
    const parts: any[] = [];

    // If an existing image is provided, include it as inlineData for image editing/background removal
    if (imageBase64) {
      let cleanData = imageBase64;
      let detectedMime = mimeType;
      if (cleanData.includes(';base64,')) {
        const matches = cleanData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          detectedMime = matches[1];
          cleanData = matches[2];
        } else {
          cleanData = cleanData.split(';base64,')[1];
        }
      }

      parts.push({
        inlineData: {
          data: cleanData,
          mimeType: detectedMime,
        },
      });
    }

    // Add user instruction prompt
    parts.push({
      text: prompt,
    });

    // Model candidates: First choice is the requested gemini-3.1-flash-image-preview
    const modelCandidates = [
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
    ];

    let lastError: any = null;
    let successfulResponse: any = null;
    let usedModel = '';

    for (const modelName of modelCandidates) {
      try {
        const config: any = {};
        if (aspectRatio) {
          config.imageConfig = {
            aspectRatio: aspectRatio,
          };
          if (imageSize && modelName === 'gemini-3.1-flash-image') {
            config.imageConfig.imageSize = imageSize;
          }
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        successfulResponse = response;
        usedModel = modelName;
        break; // Success!
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${modelName} failed:`, err?.message || err);
        // Continue to next fallback model if it was a model not found / unsupported error
      }
    }

    if (!successfulResponse) {
      throw lastError || new Error('Failed to generate image with Gemini.');
    }

    // Extract image and text from candidates
    let resultImageUrl: string | null = null;
    let resultText = '';

    const candidates = successfulResponse.candidates;
    if (candidates && candidates.length > 0) {
      const partsOut = candidates[0].content?.parts || [];
      for (const part of partsOut) {
        if (part.inlineData && part.inlineData.data) {
          const m = part.inlineData.mimeType || 'image/png';
          resultImageUrl = `data:${m};base64,${part.inlineData.data}`;
        } else if (part.text) {
          resultText = (resultText ? resultText + '\n' : '') + part.text;
        }
      }
    }

    if (!resultImageUrl) {
      res.status(500).json({
        error: 'Model did not return an image. ' + (resultText ? `Note: ${resultText}` : ''),
        text: resultText,
        modelUsed: usedModel,
      });
      return;
    }

    res.json({
      success: true,
      imageUrl: resultImageUrl,
      text: resultText,
      modelUsed: usedModel,
    });
  } catch (error: any) {
    console.error('Image generation/edit error:', error);
    res.status(500).json({
      error: error?.message || 'An unexpected error occurred during image processing.',
    });
  }
});

// Photo Inspection & Prompt Assistant endpoint
app.post('/api/analyze-photo', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image is required for analysis.' });
      return;
    }

    const ai = getGeminiClient();

    let cleanData = imageBase64;
    let detectedMime = mimeType;
    if (cleanData.includes(';base64,')) {
      const matches = cleanData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        detectedMime = matches[1];
        cleanData = matches[2];
      } else {
        cleanData = cleanData.split(';base64,')[1];
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: detectedMime,
            },
          },
          {
            text: `Analyze this product photo for e-commerce and commercial catalog preparation.
Return a JSON object with:
1. "productIdentified": Short name of the product
2. "currentIssues": Array of 2-3 specific visual defects (e.g. background clutter, reflection on glass, dust particles, uneven shadow)
3. "recommendedPrompts": Array of 4 tailored, actionable editing instructions the user can click to apply. One must be pure background removal ("Remove background completely, isolate subject on clean pure white #FFFFFF background with natural contact shadow"), one must be cleanup ("Clean up all dust, scratches, glare, and surface reflections"), one must be luxury/lifestyle staging ("Place product on modern smooth marble pedestal with soft studio fill lighting"), and one transparent cutout ("Isolate product cleanly on transparent background, preserve sharp edges").
`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze photo' });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
