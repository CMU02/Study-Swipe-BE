import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatModel } from 'openai/resources';

@Injectable()
export class VectorService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async invokeEmbedding(text: string) {
    const result = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return result.data[0].embedding;
  }

  async invokeEmbeddingBatch(texts: string[]) {
    const results = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    return results.data.map((result) => result.embedding as number[]);
  }

  async invokeChatModel(
    systemPrompt: string,
    userText: string,
    model: ChatModel = 'gpt-4o-mini',
  ): Promise<string | undefined> {
    const response = await this.openai.chat.completions.create({
      model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
    });

    return response.choices[0].message.content?.trim();
  }
}
