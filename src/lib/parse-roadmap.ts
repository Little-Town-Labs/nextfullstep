/**
 * Roadmap Parser
 *
 * Extracts structured roadmap data from GPT-4o-mini analysis text.
 * Parses phases (Immediate, 3-6 Month, 6-12 Month) and individual tasks.
 */

export interface ParsedTask {
  title: string;
  description?: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  estimatedHours?: number;
  resources?: string[];
  sortOrder: number;
}

export interface ParsedPhase {
  phaseId: string;
  phaseName: string;
  tasks: ParsedTask[];
}

export interface ParsedRoadmap {
  phases: ParsedPhase[];
  totalTasks: number;
}

/**
 * Main parser function
 * Extracts roadmap structure from GPT analysis text
 */
export function parseRoadmapFromAnalysis(analysisText: string): ParsedRoadmap {
  const phases: ParsedPhase[] = [];

  // Define phase patterns to search for
  const phasePatterns = [
    {
      phaseId: "immediate",
      phaseName: "Immediate Actions (Next 30 days)",
      keywords: ["immediate", "next 30 days", "right now", "start immediately"],
    },
    {
      phaseId: "short_term",
      phaseName: "3-6 Month Goals",
      keywords: ["3-6 month", "short term", "next few months"],
    },
    {
      phaseId: "mid_term",
      phaseName: "6-12 Month Milestones",
      keywords: ["6-12 month", "long term", "next year"],
    },
  ];

  // Split analysis into sections
  const lines = analysisText.split('\n');
  let currentPhase: ParsedPhase | null = null;
  let currentPhaseTasks: ParsedTask[] = [];
  let taskCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check if this line starts a new phase
    for (const pattern of phasePatterns) {
      const matchesPhase = pattern.keywords.some(keyword =>
        lowerLine.includes(keyword.toLowerCase())
      );

      if (matchesPhase && (line.includes(':') || line.includes('##') || line.includes('**'))) {
        // Save previous phase if exists
        if (currentPhase) {
          currentPhase.tasks = currentPhaseTasks;
          phases.push(currentPhase);
        }

        // Start new phase
        currentPhase = {
          phaseId: pattern.phaseId,
          phaseName: pattern.phaseName,
          tasks: [],
        };
        currentPhaseTasks = [];
        taskCounter = 0;
        continue;
      }
    }

    // Parse tasks within current phase
    if (currentPhase) {
      const task = parseTaskFromLine(line, lines, i, taskCounter);
      if (task) {
        currentPhaseTasks.push(task);
        taskCounter++;
      }
    }
  }

  // Save last phase
  if (currentPhase) {
    currentPhase.tasks = currentPhaseTasks;
    phases.push(currentPhase);
  }

  // If no phases found, create a generic immediate phase with extracted tasks
  if (phases.length === 0) {
    const genericTasks = extractGenericTasks(analysisText);
    if (genericTasks.length > 0) {
      phases.push({
        phaseId: "immediate",
        phaseName: "Recommended Actions",
        tasks: genericTasks,
      });
    }
  }

  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);

  return {
    phases,
    totalTasks,
  };
}

/**
 * Parse a single task from a line
 */
function parseTaskFromLine(
  line: string,
  allLines: string[],
  currentIndex: number,
  sortOrder: number
): ParsedTask | null {
  // Check if line is a task (bullet point, checkbox, numbered list)
  const taskPatterns = [
    /^[-*•]\s+(.+)$/,           // Bullet: - Task or • Task
    /^[\d]+\.\s+(.+)$/,         // Numbered: 1. Task
    /^\[[ x]\]\s+(.+)$/,        // Checkbox: [ ] Task or [x] Task
    /^→\s+(.+)$/,               // Arrow: → Task
  ];

  let taskTitle: string | null = null;
  for (const pattern of taskPatterns) {
    const match = line.match(pattern);
    if (match) {
      taskTitle = match[1].trim();
      break;
    }
  }

  if (!taskTitle) return null;

  // Remove markdown formatting from title
  taskTitle = taskTitle
    .replace(/\*\*/g, '')  // Remove bold
    .replace(/\*/g, '')    // Remove italics
    .replace(/`/g, '')     // Remove code blocks
    .trim();

  // Determine priority from keywords
  let priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW" = "NORMAL";
  const lowerTitle = taskTitle.toLowerCase();

  if (lowerTitle.includes('critical') || lowerTitle.includes('must') || lowerTitle.includes('essential')) {
    priority = "CRITICAL";
  } else if (lowerTitle.includes('important') || lowerTitle.includes('urgent') || lowerTitle.includes('asap')) {
    priority = "HIGH";
  } else if (lowerTitle.includes('optional') || lowerTitle.includes('bonus') || lowerTitle.includes('if time')) {
    priority = "LOW";
  }

  // Extract description from next lines (if indented or continuation)
  let description = "";
  for (let j = currentIndex + 1; j < Math.min(currentIndex + 3, allLines.length); j++) {
    const nextLine = allLines[j].trim();
    if (nextLine.startsWith(' ') || nextLine.startsWith('\t')) {
      description += nextLine.trim() + ' ';
    } else {
      break;
    }
  }

  // Extract resources (URLs, course names)
  const resources: string[] = [];
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urlMatches = (taskTitle + ' ' + description).match(urlPattern);
  if (urlMatches) {
    resources.push(...urlMatches);
  }

  // Estimate hours based on keywords
  let estimatedHours: number | undefined;
  const hourPatterns = [
    /(\d+)\s*hours?/i,
    /(\d+)\s*hrs?/i,
    /(\d+)\s*h\b/i,
  ];

  for (const pattern of hourPatterns) {
    const match = (taskTitle + ' ' + description).match(pattern);
    if (match) {
      estimatedHours = parseInt(match[1]);
      break;
    }
  }

  return {
    title: taskTitle,
    description: description.trim() || undefined,
    priority,
    estimatedHours,
    resources: resources.length > 0 ? resources : undefined,
    sortOrder,
  };
}

/**
 * Extract tasks when no clear phase structure is found
 */
function extractGenericTasks(text: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const lines = text.split('\n');
  let taskCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const task = parseTaskFromLine(line, lines, i, taskCounter);
    if (task) {
      tasks.push(task);
      taskCounter++;
    }
  }

  return tasks;
}

/**
 * Utility: Extract timeline estimate from verdict section
 */
export function extractTimelineFromAnalysis(analysisText: string): string | null {
  const timelinePatterns = [
    /timeline[:\s]+([^.\n]+)/i,
    /(\d+-\d+\s+months?)/i,
    /(\d+\s+weeks?)/i,
    /(immediate|right away|asap)/i,
  ];

  for (const pattern of timelinePatterns) {
    const match = analysisText.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Utility: Extract strengths from analysis
 */
export function extractStrengthsFromAnalysis(analysisText: string): string[] {
  const strengths: string[] = [];
  const lines = analysisText.split('\n');
  let inStrengthsSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('strength') || lowerLine.includes('you have') || lowerLine.includes('✅')) {
      inStrengthsSection = true;
      continue;
    }

    if (inStrengthsSection) {
      // Stop if we hit another section
      if (lowerLine.includes('gap') || lowerLine.includes('area') || lowerLine.includes('need')) {
        break;
      }

      // Extract bullet points
      if (line.match(/^[-*•]\s+(.+)$/)) {
        const strength = line.replace(/^[-*•]\s+/, '').trim();
        if (strength.length > 5) {
          strengths.push(strength);
        }
      }
    }
  }

  return strengths;
}

/**
 * Utility: Extract gaps from analysis
 */
export function extractGapsFromAnalysis(analysisText: string): string[] {
  const gaps: string[] = [];
  const lines = analysisText.split('\n');
  let inGapsSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('gap') || lowerLine.includes('area') || lowerLine.includes('need') || lowerLine.includes('⚠️')) {
      inGapsSection = true;
      continue;
    }

    if (inGapsSection) {
      // Stop if we hit roadmap section
      if (lowerLine.includes('roadmap') || lowerLine.includes('action') || lowerLine.includes('next steps')) {
        break;
      }

      // Extract bullet points
      if (line.match(/^[-*•]\s+(.+)$/)) {
        const gap = line.replace(/^[-*•]\s+/, '').trim();
        if (gap.length > 5) {
          gaps.push(gap);
        }
      }
    }
  }

  return gaps;
}
