export interface SectionDefinition {
  id: string;
  name: string;
  description: string;
  formatDescription: string;
}

export const SECTION_LIBRARY: SectionDefinition[] = [
  { id: "introduction", name: "Introduction", description: "A high-level overview explaining the concept clearly.", formatDescription: "A string containing 2-3 brief sentences." },
  { id: "quickOverview", name: "Quick Overview", description: "A brief summary for quick reading.", formatDescription: "A short string summarizing the core point." },
  { id: "motivation", name: "Motivation", description: "Why we need this concept and the gap it fills.", formatDescription: "A detailed string." },
  { id: "realLifeAnalogy", name: "Real Life Analogy", description: "A memorable real-world analogy to help build a mental model.", formatDescription: "A creative and clear string." },
  { id: "historicalBackground", name: "Historical Background", description: "Brief history of the topic's invention.", formatDescription: "A string." },
  { id: "coreIdea", name: "Core Idea", description: "The central thesis or mechanism.", formatDescription: "A precise string explanation." },
  { id: "keyInsight", name: "Key Insight", description: "The trick or intuition behind the algorithm.", formatDescription: "A string highlighting the 'aha!' moment." },
  { id: "requirements", name: "Requirements", description: "What is strictly needed to use this (e.g. sorted array).", formatDescription: "An array of strings." },
  { id: "prerequisites", name: "Prerequisites", description: "Concepts to know before learning this.", formatDescription: "An array of strings." },
  { id: "mathematicalExplanation", name: "Mathematical Explanation", description: "Formal math or proof if relevant.", formatDescription: "A string containing plain text or formulas." },
  { id: "visualization", name: "Visualization", description: "ASCII text-based diagrams showing state.", formatDescription: "A string containing a multi-line ASCII diagram." },
  { id: "asciiDiagram", name: "ASCII Diagram", description: "Complex text-based visualizations.", formatDescription: "A string containing a multi-line ASCII diagram." },
  { id: "dryRun", name: "Dry Run", description: "Step-by-step trace of variables on a sample input.", formatDescription: "A string with step-by-step tracing logic." },
  { id: "algorithm", name: "Algorithm", description: "Step-by-step logical approach.", formatDescription: "An array of strings where each is a step." },
  { id: "pseudocode", name: "Pseudocode", description: "Language-agnostic code logic.", formatDescription: "A string containing structured pseudocode." },
  { id: "code", name: "Code", description: "Implementation examples in standard languages.", formatDescription: "An array of objects with keys: { language: 'cpp'|'java'|'python'|'javascript', code: '...' }" },
  { id: "lineByLineExplanation", name: "Line-by-Line Explanation", description: "Explains tricky code lines.", formatDescription: "An array of objects: { line: number, explanation: 'string' }" },
  { id: "memoryVisualization", name: "Memory Visualization", description: "How memory is allocated.", formatDescription: "A string containing ASCII memory layout." },
  { id: "timeComplexity", name: "Time Complexity", description: "O(...) time and detailed explanation.", formatDescription: "An object with keys: { complexity: 'O(...)', explanation: 'string' }" },
  { id: "spaceComplexity", name: "Space Complexity", description: "O(...) space and detailed explanation.", formatDescription: "An object with keys: { complexity: 'O(...)', explanation: 'string' }" },
  { id: "advantages", name: "Advantages", description: "Pros of using this approach.", formatDescription: "An array of strings." },
  { id: "limitations", name: "Limitations", description: "Cons of using this approach.", formatDescription: "An array of strings." },
  { id: "commonMistakes", name: "Common Mistakes", description: "Pitfalls during implementation.", formatDescription: "An array of strings." },
  { id: "commonMisconceptions", name: "Common Misconceptions", description: "Theoretical misunderstandings.", formatDescription: "An array of strings." },
  { id: "edgeCases", name: "Edge Cases", description: "Boundary conditions to handle (e.g. empty array).", formatDescription: "An array of strings." },
  { id: "recognitionTricks", name: "Recognition Tricks", description: "Keywords in interview problems.", formatDescription: "An array of strings." },
  { id: "whenToUse", name: "When To Use", description: "Scenarios perfectly suited for this.", formatDescription: "An array of strings." },
  { id: "whenNotToUse", name: "When NOT To Use", description: "Scenarios where this fails or is suboptimal.", formatDescription: "An array of strings." },
  { id: "comparisonTable", name: "Comparison Table", description: "Comparisons to alternative structures/algorithms.", formatDescription: "An array of objects: { approach: 'string', pros: 'string', cons: 'string' }" },
  { id: "alternativeApproaches", name: "Alternative Approaches", description: "Other ways to solve.", formatDescription: "An array of strings." },
  { id: "internalWorking", name: "Internal Working", description: "Under-the-hood details.", formatDescription: "A string." },
  { id: "flowDiagram", name: "Flow Diagram", description: "ASCII or Mermaid flowchart.", formatDescription: "A string." },
  { id: "optimizationTips", name: "Optimization Tips", description: "How to make it faster/smaller.", formatDescription: "An array of strings." },
  { id: "interviewPerspective", name: "Interview Perspective", description: "What interviewers look for.", formatDescription: "A string." },
  { id: "frequentlyAskedQuestions", name: "Frequently Asked Questions", description: "Common FAQs.", formatDescription: "An array of objects: { question: 'string', answer: 'string' }" },
  { id: "keyTakeaways", name: "Key Takeaways", description: "TL;DR summary.", formatDescription: "An array of strings." },
  { id: "cheatSheet", name: "Cheat Sheet", description: "Quick formulas and templates.", formatDescription: "A string." },
  { id: "practiceProblems", name: "Practice Problems", description: "LeetCode problem links.", formatDescription: "An array of objects: { name: 'string', id: 'string', difficulty: 'string', pattern: 'string', leetcodeUrl: 'string', leetVisionUrl: 'string' }" }
];
