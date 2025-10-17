/**
 * Assessment Questions for Each Career Role
 * Extracted from career-pathing-prompts.md
 */

export interface AssessmentQuestion {
  number: number;
  title: string;
  question: string;
  placeholder?: string;
}

export const ASSESSMENT_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  "ai-prompt-engineer": [
    {
      number: 1,
      title: "Background",
      question:
        "What is your professional background? (current/recent job title, industry, years of experience - we're looking for transferable skills, not specific degrees)",
      placeholder:
        "e.g., Marketing Manager, Healthcare, 5 years...",
    },
    {
      number: 2,
      title: "Writing & Communication",
      question:
        "Rate your writing skills 1-10. Describe your experience with: (a) Professional writing (reports, emails, documentation), (b) Creative writing, (c) Technical writing or explaining complex topics simply.",
      placeholder:
        "e.g., 8/10 - I write weekly reports, created training docs...",
    },
    {
      number: 3,
      title: "AI Tool Experience",
      question:
        "Which AI tools have you used? (ChatGPT, Claude, Midjourney, Jasper, Copy.ai, etc.) For each, describe: (a) How long you've used it, (b) What you've used it for, (c) Any frustrations or limitations you've encountered.",
      placeholder:
        "e.g., ChatGPT for 6 months for content drafting, Claude for...",
    },
    {
      number: 4,
      title: "Prompt Crafting",
      question:
        "Have you ever crafted detailed prompts to get better AI outputs? If yes, share an example of: (a) A complex prompt you created, (b) The problem you were solving, (c) How you refined it to get better results.",
      placeholder:
        "e.g., Created a prompt for generating product descriptions...",
    },
    {
      number: 5,
      title: "Problem-Solving",
      question:
        "Describe a time you had to figure out how to communicate a complex request or requirement to get the result you needed. (Could be to AI, to a person, to a search engine - we're assessing communication strategy.)",
      placeholder:
        "e.g., Needed to explain our product vision to developers...",
    },
    {
      number: 6,
      title: "Domain Knowledge",
      question:
        "Do you have expertise in any specific domain? (marketing, customer service, education, legal, healthcare, etc.) Describe your knowledge depth and how AI could be applied there.",
      placeholder:
        "e.g., 7 years in healthcare operations, AI could help with...",
    },
    {
      number: 7,
      title: "Portfolio & Projects",
      question:
        "Do you have any examples of: (a) AI-generated content you've created, (b) Prompt templates or systems you've built, (c) Documentation of your prompt engineering work? If not documented, describe what you've created.",
      placeholder:
        "e.g., Created a library of prompts for our marketing team...",
    },
    {
      number: 8,
      title: "Goals & Context",
      question:
        "What is your: (a) Current location (city/region for salary calibration), (b) Timeline goal (when do you want to start earning as a Prompt Engineer?), (c) Preferred work arrangement (full-time, freelance, remote, hybrid)?",
      placeholder:
        "e.g., Los Angeles, CA; Want to freelance within 3 months; Remote preferred",
    },
  ],
  "ai-content-creator": [
    {
      number: 1,
      title: "Content Background",
      question:
        "What is your content creation experience? (writing, video, graphics, social media, etc. - describe your primary content type, years of experience, and where your work has been published/used)",
      placeholder:
        "e.g., Blog writing for 3 years, published on Medium and company blog...",
    },
    {
      number: 2,
      title: "Writing & Creative Skills",
      question:
        "Rate your core content skills 1-10: (a) Writing (blog posts, articles, copy), (b) Editing and proofreading, (c) Creativity and ideation, (d) Understanding of brand voice and tone. Share examples of your best work if possible.",
      placeholder:
        "e.g., Writing 9/10, Editing 8/10, Creativity 7/10...",
    },
    {
      number: 3,
      title: "AI Tool Experience",
      question:
        "Which AI content tools have you used? For each tool, describe: (a) What you've created with it (ChatGPT, Jasper, Copy.ai, Midjourney, etc.), (b) How long you've used it, (c) Your comfort level with prompt engineering for content.",
      placeholder:
        "e.g., Jasper for 4 months creating blog posts, ChatGPT for...",
    },
    {
      number: 4,
      title: "Content Quality & Editing",
      question:
        "Describe your process for: (a) Taking AI-generated content from draft to publication-ready, (b) Fact-checking and accuracy verification, (c) Maintaining authenticity while using AI, (d) Avoiding AI-obvious phrasing or style. Share an example of heavily editing AI content.",
      placeholder:
        "e.g., I always run AI drafts through 3 editing passes...",
    },
    {
      number: 5,
      title: "Marketing & SEO Knowledge",
      question:
        "Rate your understanding 1-10 of: (a) SEO principles and keyword optimization, (b) Content marketing strategy, (c) Audience targeting and persona development, (d) Performance metrics (engagement, conversions, traffic). Describe any campaigns you've run.",
      placeholder:
        "e.g., SEO 7/10, ran a content campaign that increased traffic by...",
    },
    {
      number: 6,
      title: "Domain Expertise",
      question:
        "Do you have specialized knowledge in any content niche? (tech, finance, healthcare, lifestyle, B2B, etc.) How deep is your expertise? Can you create authoritative content in this area with minimal research?",
      placeholder:
        "e.g., SaaS B2B content for 5 years, can write about...",
    },
    {
      number: 7,
      title: "Portfolio & Work Samples",
      question:
        "What published work can you share? (a) Do you have a portfolio website or published articles? (b) What's your most successful piece of content? (c) Can you demonstrate before/after examples of AI-assisted content? (d) What metrics prove your content's effectiveness?",
      placeholder:
        "e.g., Portfolio at mysite.com, top article got 50K views...",
    },
    {
      number: 8,
      title: "Goals & Context",
      question:
        "What is your: (a) Preferred work arrangement (freelance, part-time, full-time, agency, in-house), (b) Content type focus (blog posts, social media, video scripts, ad copy, etc.), (c) Income goals ($/hour for freelance or $/year for full-time), (d) Timeline to start earning as AI Content Creator?",
      placeholder:
        "e.g., Freelance, blog posts and LinkedIn content, $75/hr, start in 2 months",
    },
  ],
  "ai-coach": [
    {
      number: 1,
      title: "Training & Coaching Background",
      question:
        "What is your experience with training, teaching, or coaching? (years of experience, audience types, training modalities - in-person, virtual, one-on-one, group sessions)",
      placeholder:
        "e.g., Corporate trainer for 5 years, conducted 100+ workshops...",
    },
    {
      number: 2,
      title: "AI Tool Proficiency",
      question:
        "Which AI tools do you use regularly? For each tool, describe: (a) Your proficiency level (ChatGPT, Claude, Midjourney, Copilot, Gemini, etc.), (b) How you use it in your daily workflow, (c) Advanced techniques you've mastered (prompt engineering, custom instructions, etc.).",
      placeholder:
        "e.g., ChatGPT daily for research and content, Claude for...",
    },
    {
      number: 3,
      title: "Productivity & Workflow Expertise",
      question:
        "Describe your experience with: (a) Workflow optimization and productivity methodologies, (b) Identifying inefficiencies in work processes, (c) Implementing new tools or systems, (d) Measuring productivity improvements. Share a specific example.",
      placeholder:
        "e.g., Implemented new CRM system that reduced admin time by 30%...",
    },
    {
      number: 4,
      title: "Communication & Teaching Style",
      question:
        "Rate yourself 1-10 on: (a) Explaining complex concepts simply, (b) Adapting teaching style to different learning preferences, (c) Patience with technology-resistant learners, (d) Creating engaging training materials. What's your teaching philosophy?",
      placeholder:
        "e.g., Explaining 9/10, Adapting 8/10, my philosophy is...",
    },
    {
      number: 5,
      title: "Change Management Sensitivity",
      question:
        "Describe your experience with: (a) Helping people adopt new technologies or processes, (b) Addressing resistance or fear of change, (c) Building confidence in hesitant users, (d) Managing expectations about AI capabilities and limitations.",
      placeholder:
        "e.g., Led digital transformation project, helped 50 employees...",
    },
    {
      number: 6,
      title: "Curriculum & Content Development",
      question:
        "Have you created training materials? (a) What types (presentations, guides, videos, workshops)? (b) For what topics or tools? (c) How do you structure learning progression? (d) Can you show examples of training content you've developed?",
      placeholder:
        "e.g., Created 20+ slide decks, video tutorials on...",
    },
    {
      number: 7,
      title: "Industry or Domain Expertise",
      question:
        "What industry or functional expertise do you have? (marketing, sales, operations, HR, finance, etc.) How deep is your understanding of: (a) Common workflows in this domain, (b) Pain points AI could address, (c) Realistic AI applications for this field?",
      placeholder:
        "e.g., HR operations for 8 years, AI can help with recruitment...",
    },
    {
      number: 8,
      title: "Goals & Context",
      question:
        "What is your: (a) Current location (city/region for salary calibration), (b) Preferred work setting (in-house corporate, consulting, freelance), (c) Target audience (executives, knowledge workers, specific departments), (d) Timeline to start as AI Coach?",
      placeholder:
        "e.g., Chicago, IL; Prefer consulting; Target mid-level managers; Start in 4 months",
    },
  ],
};

export function getQuestionsForRole(roleId: string): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS[roleId] || [];
}
