/**
 * Test Perplexity API connectivity.
 * Sends a simple test query and prints the response.
 *
 * Usage: npx tsx scripts/test-perplexity.ts
 *
 * Requires PERPLEXITY_API_KEY in .env.local or environment.
 */

import * as fs from 'fs';
import * as path from 'path';

// Manually load .env.local (instead of requiring dotenv dependency)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmed.substring(0, eqIndex).trim();
                const value = trimmed.substring(eqIndex + 1).trim();
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    }
}

(async () => {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey || apiKey.startsWith('dummy')) {
        console.error('❌ PERPLEXITY_API_KEY is not set.');
        console.error('   Set it in .env.local or as an environment variable.');
        process.exit(1);
    }

    console.log('🔗 Testing Perplexity API connectivity...');
    console.log(`   Model: ${process.env.PERPLEXITY_MODEL || 'sonar-pro'}`);
    console.log(`   Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log('');

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.PERPLEXITY_MODEL || 'sonar-pro',
                messages: [
                    {
                        role: 'user',
                        content: 'What is the current market capitalization of Reliance Industries on NSE India? Reply in one sentence.',
                    },
                ],
                temperature: 0.1,
                max_tokens: 200,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API returned ${response.status}: ${errorText}`);
            process.exit(1);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        console.log('✅ Perplexity API is working!');
        console.log('');
        console.log('📝 Response:');
        console.log(`   ${content}`);
        console.log('');
        console.log('📊 Usage:');
        console.log(`   Prompt tokens: ${data.usage?.prompt_tokens}`);
        console.log(`   Completion tokens: ${data.usage?.completion_tokens}`);
        console.log(`   Total tokens: ${data.usage?.total_tokens}`);
    } catch (error) {
        console.error('❌ Connection failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
})();
