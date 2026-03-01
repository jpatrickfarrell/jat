#!/usr/bin/env node
/**
 * conversation-memory-upsert.js
 *
 * Upserts a conversation memory entry into the bases system after a chat task
 * completes. Called from jat-complete-bundle for chat-type tasks.
 *
 * Usage:
 *   conversation-memory-upsert.js --task <id> --project <path> --summary <json>
 *
 * Arguments:
 *   --task <id>       Task ID (required)
 *   --project <path>  Project directory path (required)
 *   --summary <json>  JSON array of summary bullet points (required)
 *
 * The script reads task details to extract sender info (Author from notes,
 * Origin from description), constructs a sender_key, and upserts a dated
 * conversation entry into the conversation base for that sender.
 */

import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_PATH = join(__dirname, '..', '..', 'lib', 'bases.js');

async function main() {
  const args = process.argv.slice(2);
  let taskId = '', projectPath = '', summaryJson = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--task': taskId = args[++i]; break;
      case '--project': projectPath = args[++i]; break;
      case '--summary': summaryJson = args[++i]; break;
      case '--help':
        console.log('Usage: conversation-memory-upsert.js --task <id> --project <path> --summary <json>');
        process.exit(0);
    }
  }

  if (!taskId || !projectPath || !summaryJson) {
    console.error('Error: --task, --project, and --summary are required');
    process.exit(1);
  }

  // Parse summary
  let summary;
  try {
    summary = JSON.parse(summaryJson);
    if (!Array.isArray(summary)) summary = [String(summary)];
  } catch {
    summary = [summaryJson];
  }

  // Get task details
  let task;
  try {
    const output = execFileSync('jt', ['show', taskId, '--json'], {
      encoding: 'utf-8', timeout: 15000, cwd: projectPath
    });
    const parsed = JSON.parse(output);
    task = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (err) {
    console.error(`Failed to read task ${taskId}: ${err.message}`);
    process.exit(1);
  }

  if (!task) {
    console.error(`Task ${taskId} not found`);
    process.exit(1);
  }

  // Only process chat tasks
  if (task.issue_type !== 'chat') {
    console.log(`Skipping: task ${taskId} is type '${task.issue_type}', not 'chat'`);
    process.exit(0);
  }

  // Extract sender info
  const { senderKey, senderName } = extractSenderInfo(task);
  if (!senderKey) {
    console.log('Skipping: could not extract sender info from task');
    process.exit(0);
  }

  // Build conversation entry
  const date = new Date().toISOString().split('T')[0];
  const topicLine = task.title || 'Untitled conversation';
  const resolutionLines = summary.map(s => `- ${s}`).join('\n');

  // Extract tone from task description/notes if available
  const tone = extractTone(task);

  let entry = `## ${date} - ${topicLine}\n`;
  entry += `**Topic:** ${topicLine}\n`;
  entry += `**Resolution:**\n${resolutionLines}\n`;
  if (tone) {
    entry += `**Tone:** ${tone}\n`;
  }

  // Import bases library and upsert
  const bases = await import(LIB_PATH);
  const { base, created } = bases.upsertConversationEntry(projectPath, {
    senderKey,
    senderName,
    entry,
  });

  if (created) {
    console.log(`Created conversation base '${base.name}' (${base.id}) for ${senderKey}`);
  } else {
    console.log(`Updated conversation base '${base.name}' (${base.id}) for ${senderKey}`);
  }

  // Output base ID for caller to use
  console.log(`BASE_ID=${base.id}`);
}

/**
 * Extract sender_key and senderName from task metadata.
 * Looks at notes for "Author: X" and description for "Origin: type channel id".
 */
function extractSenderInfo(task) {
  const notes = task.notes || '';
  const desc = task.description || '';

  // Extract author from notes: "Author: SomeName"
  const authorMatch = notes.match(/^Author:\s*(.+)$/m) || desc.match(/^From:\s*(.+)$/m);
  const author = authorMatch ? authorMatch[1].trim() : '';

  if (!author) return { senderKey: null, senderName: null };

  // Extract origin from description: "Origin: telegram channel -1001234567890"
  const originMatch = desc.match(/^Origin:\s*(\S+)(?:\s+channel\s+(\S+))?$/m);
  const adapterType = originMatch ? originMatch[1] : 'unknown';
  const channelId = originMatch ? (originMatch[2] || '') : '';

  const senderKey = [adapterType, channelId, author].filter(Boolean).join(':');
  const senderName = `${author} (${adapterType}${channelId ? ' ' + channelId : ''})`;

  return { senderKey, senderName };
}

/**
 * Attempt to infer conversation tone from task content.
 * Returns a brief tone descriptor or empty string.
 */
function extractTone(task) {
  const text = `${task.title || ''} ${task.description || ''}`.toLowerCase();

  if (/urgent|asap|critical|emergency/i.test(text)) return 'Urgent';
  if (/frustrated|angry|annoyed|broken|still not/i.test(text)) return 'Frustrated';
  if (/thanks|thank you|appreciate|great|awesome/i.test(text)) return 'Appreciative';
  if (/question|how do|can you|is it possible/i.test(text)) return 'Inquisitive';
  if (/bug|issue|problem|error|crash|fail/i.test(text)) return 'Reporting issue';

  return '';
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
