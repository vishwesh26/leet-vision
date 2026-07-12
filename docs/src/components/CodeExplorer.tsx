"use client";

import React, { useState } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";

interface CodeLanguage {
  language: string;
  code: string;
}

// Token styles mapping to standard premium dark theme colors
const tokenStyles: Record<string, string> = {
  comment: "text-[#7f848e] italic",
  string: "text-[#98c379]",
  preprocessor: "text-[#e06c75] font-semibold",
  number: "text-[#61afef]",
  keyword: "text-[#e06c75] font-semibold",
  builtin: "text-[#e5c07b]",
  operator: "text-[#56b6c2]",
  identifier: "text-[#abb2bf]",
  whitespace: "",
  other: "text-[#abb2bf]"
};

// Custom tokenizer for basic syntax highlighting of C++, Java, JS, Python
function tokenize(code: string, language: string) {
  const rules = [
    { type: 'comment', regex: language.toLowerCase() === 'python' ? /^#.*$/ : /^\/\/.*$/ },
    { type: 'string', regex: /^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/ },
    { type: 'preprocessor', regex: /^#[a-zA-Z]+/ },
    { type: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
    { type: 'keyword', regex: /^\b(alignas|alignof|and|and_eq|asm|atomic_cancel|atomic_commit|atomic_noexcept|auto|bitand|bitor|bool|boolean|break|case|catch|char|char8_t|char16_t|char32_t|class|compl|concept|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|def|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|reflexpr|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|synchronized|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while|xor|xor_eq|let|var|const|function|def|elif|import|from|as|in|is|not|and|or|lambda|pass|try|except|finally|raise|with|yield|global|nonlocal|assert|class|interface|extends|implements|package|throws|instanceof|transient|volatile|strictfp|null|undefined|NaN)\b/ },
    { type: 'builtin', regex: /^\b(push_back|insert|begin|end|size|length|append|print|println|log|push|pop|top|front|back|shift|unshift|splice|slice|filter|map|reduce|forEach|find|findIndex|includes|indexOf|lastIndexOf|split|join|replace|replaceAll|trim|toLowerCase|toUpperCase|charAt|substring|valueOf|toString|parseInt|parseFloat)\b/ },
    { type: 'operator', regex: /^(?:::|->|[-+*/%=<>!&|^~]=?|&&|\|\||\+\+|--|\?|:)/ },
    { type: 'identifier', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: 'whitespace', regex: /^\s+/ },
    { type: 'other', regex: /^./ }
  ];

  let remaining = code;
  const tokens: { type: string; value: string }[] = [];

  while (remaining.length > 0) {
    let matched = false;
    for (const rule of rules) {
      const match = remaining.match(rule.regex);
      if (match) {
        tokens.push({ type: rule.type, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: 'other', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

// Highly robust utility to clean verbose comments and keep only code + complexity tags
const cleanCode = (code: string, language: string): string => {
  if (!code) return "";
  const lines = code.split("\n");
  const cleanedLines: string[] = [];
  const isPython = language.toLowerCase() === "python";

  for (let line of lines) {
    const trimmed = line.trim();

    // 1. Skip pure comment lines
    if (trimmed.startsWith("//")) {
      continue;
    }
    if (trimmed.startsWith("#")) {
      // Keep C++ preprocessor directives
      if (!isPython && (trimmed.startsWith("#include") || trimmed.startsWith("#define") || trimmed.startsWith("#pragma") || trimmed.startsWith("#ifndef") || trimmed.startsWith("#endif"))) {
        // Keep these preprocessor lines
      } else {
        continue;
      }
    }

    // Skip pure text explanation lines (e.g. "Line 1:...", "L12:...")
    if (/^(?:Line\s+\d+:|L\d+:|\/\/s*L\d+|\/\/s*Line\s+\d+)/i.test(trimmed)) {
      continue;
    }

    // Skip any standalone natural language descriptions
    if (/^(?:Includes the standard|Defines the|Calls the|Checks if|Prints a message|Returns 0|Declares and|The main function|Initialize a|Define a target|Call linearSearch|Check if the target|Executed if)/i.test(trimmed)) {
      continue;
    }

    // 2. Strip inline comments from the end of valid lines, but preserve complexity notations (e.g. "// O(1)")
    let cleanedLine = line;

    if (!isPython) {
      // Look for O(1) or O(N) complexity notes in the comment
      const complexityMatch = line.match(/\/\/\s*(O\(.+\))/i);
      cleanedLine = line.split("//")[0].trimEnd();
      if (complexityMatch) {
        cleanedLine = `${cleanedLine} // ${complexityMatch[1]}`;
      }
    } else {
      const complexityMatch = line.match(/#\s*(O\(.+\))/i);
      cleanedLine = line.split("#")[0].trimEnd();
      if (trimmed.startsWith("#include") || trimmed.startsWith("#define")) {
        cleanedLine = line; // Maintain C++ style lines if present
      } else if (complexityMatch) {
        cleanedLine = `${cleanedLine} # ${complexityMatch[1]}`;
      }
    }

    cleanedLines.push(cleanedLine);
  }

  // Remove empty lines from start/end and filter redundant double spacers inside code
  return cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

export default function CodeExplorer({ examples }: { examples: any }) {
  const codeExamples = Array.isArray(examples) ? (examples as CodeLanguage[]) : [];
  
  // Find which languages are actually available in the payload
  const availableLangs = codeExamples.map(ex => ex.language.toLowerCase());
  
  const [activeLang, setActiveLang] = useState<string>(() => {
    return availableLangs[0] || "cpp";
  });
  const [copied, setCopied] = useState(false);

  const activeExample = codeExamples.find(
    (ex) => ex.language.toLowerCase() === activeLang.toLowerCase()
  );

  const handleCopy = () => {
    if (!activeExample) return;
    const sanitizedCode = cleanCode(activeExample.code, activeExample.language);
    navigator.clipboard.writeText(sanitizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      cpp: "C++",
      java: "Java",
      python: "Python",
      javascript: "JavaScript"
    };
    return labels[lang.toLowerCase()] || lang.toUpperCase();
  };

  if (codeExamples.length === 0) return null;

  const activeSanitizedCode = activeExample ? cleanCode(activeExample.code, activeExample.language) : "";

  return (
    <div className="my-6">
      {/* Code Container - Styled as dark in both light/dark modes */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#090d16]">
        {/* Header Bar with Dropdown & Copy */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0d1017] border-b border-gray-800">
          {/* Dropdown Selector */}
          <div className="relative flex items-center">
            <select
              value={activeLang}
              onChange={(e) => setActiveLang(e.target.value)}
              className="appearance-none bg-transparent pr-8 pl-1 py-1 text-xs font-bold text-gray-400 hover:text-gray-200 focus:outline-none cursor-pointer font-mono select-none border-0"
            >
              {codeExamples.map((ex) => (
                <option 
                  key={ex.language} 
                  value={ex.language.toLowerCase()}
                  className="bg-[#0d1017] text-gray-200 font-mono font-bold"
                >
                  {getLanguageLabel(ex.language)}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={12} 
              className="absolute right-2 pointer-events-none text-gray-500" 
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Copy Code"
          >
            {copied ? (
              <>
                <Check className="text-green-500" size={13} />
                <span className="text-[11px] font-medium text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="text-[11px] font-medium">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content with syntax highlighting */}
        <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-gray-300 max-h-[500px]">
          <pre className="m-0 bg-transparent! p-0! border-0! text-inherit!">
            <code className="bg-transparent! text-inherit! p-0! font-mono">
              {tokenize(activeSanitizedCode, activeExample?.language || "cpp").map((token, i) => {
                const styleClass = tokenStyles[token.type] || "";
                return (
                  <span key={i} className={styleClass}>
                    {token.value}
                  </span>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
