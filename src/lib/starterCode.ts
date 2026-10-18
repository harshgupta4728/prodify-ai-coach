// Starter code and answer checking for the problem editor.
//
// Every test input looks like LeetCode's example text, e.g.  nums = [2,7,11,15], target = 9
// and is sent to the program on stdin. For Python and JavaScript the starter code already
// reads that line, calls solve(nums, target) and prints the result as JSON, so the user only
// writes solve(). The other languages get a template that reads stdin and explains the format.

export const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

interface Example {
  input: string;
  output: string;
}

// Parameter names from "nums = [2,7,11,15], target = 9" -> ["nums", "target"],
// skipping anything inside brackets or quotes
export function parameterNames(input: string): string[] {
  const names: string[] = [];
  let depth = 0;
  let inString = false;
  let token = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      if (ch === '"' && input[i - 1] !== "\\") inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "[" || ch === "{" || ch === "(") depth++;
    else if (ch === "]" || ch === "}" || ch === ")") depth--;
    else if (depth === 0 && ch === "=" && input[i + 1] !== "=") {
      const name = token.trim().split(",").pop()?.trim() || "";
      if (/^[A-Za-z_]\w*$/.test(name)) names.push(name);
      token = "";
      continue;
    }
    if (depth === 0) token += ch;
  }
  return names;
}

const formatComment = (example?: Example) => example
  ? [`Input (stdin), exactly as in the examples:  ${example.input}`, `Print the answer like the expected output:  ${example.output}`]
  : ["Read the input from stdin and print the answer"];

export function starterCode(language: string, examples: Example[] = []): string {
  const example = examples[0];
  const params = example ? parameterNames(example.input) : [];
  const [inputLine, outputLine] = formatComment(example);

  if (language === "python" && params.length > 0) {
    return `def solve(${params.join(", ")}):
    # Write your solution here and return the answer.
    return None


# ---- Reads the test input, calls solve() and prints the answer (no need to change) ----
import sys, json, re

if __name__ == "__main__":
    text = sys.stdin.read().strip()
    args = json.loads("{" + re.sub(r'(^|,)\\s*([A-Za-z_]\\w*)\\s*=', r'\\1"\\2":', text) + "}") if text else {}
    print(json.dumps(solve(**args), separators=(",", ":")))
`;
  }

  if (language === "javascript" && params.length > 0) {
    return `function solve(${params.join(", ")}) {
  // Write your solution here and return the answer.
}


// ---- Reads the test input, calls solve() and prints the answer (no need to change) ----
const text = require("fs").readFileSync(0, "utf8").trim();
const args = text ? JSON.parse("{" + text.replace(/(^|,)\\s*([A-Za-z_]\\w*)\\s*=/g, '$1"$2":') + "}") : {};
console.log(JSON.stringify(solve(...Object.values(args))));
`;
  }

  switch (language) {
    case "python":
      return `import sys

# ${inputLine}
# ${outputLine ?? ""}
data = sys.stdin.read().strip()

# Your code here
`;
    case "javascript":
      return `// ${inputLine}
// ${outputLine ?? ""}
const data = require("fs").readFileSync(0, "utf8").trim();

// Your code here
`;
    case "cpp":
      return `#include <bits/stdc++.h>
using namespace std;

int main() {
    // ${inputLine}
    // ${outputLine ?? ""}
    string input((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());

    // Your code here

    return 0;
}
`;
    case "java":
      return `import java.util.*;
import java.io.*;

class Main {
    public static void main(String[] args) throws IOException {
        // ${inputLine}
        // ${outputLine ?? ""}
        String input = new String(System.in.readAllBytes()).trim();

        // Your code here
    }
}
`;
    case "csharp":
      return `using System;
using System.Linq;
using System.Collections.Generic;

class Program {
    static void Main() {
        // ${inputLine}
        // ${outputLine ?? ""}
        string input = Console.In.ReadToEnd().Trim();

        // Your code here
    }
}
`;
    case "go":
      return `package main

import (
    "fmt"
    "io"
    "os"
    "strings"
)

func main() {
    // ${inputLine}
    // ${outputLine ?? ""}
    data, _ := io.ReadAll(os.Stdin)
    input := strings.TrimSpace(string(data))
    _ = input

    // Your code here
    fmt.Println("")
}
`;
    case "rust":
      return `use std::io::Read;

fn main() {
    // ${inputLine}
    // ${outputLine ?? ""}
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let _input = input.trim();

    // Your code here
}
`;
    default:
      return "// Write your solution here\n";
  }
}

// Compares program output with the expected answer, forgiving formatting that doesn't
// change the answer: spacing, Python's True/False/None and quotes, 2.0 vs 2.00000.
const normalizeOutput = (text: string) => {
  const converted = text.trim()
    .replace(/'/g, '"')
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null");
  let result = "";
  let inString = false;
  for (let i = 0; i < converted.length; i++) {
    const ch = converted[i];
    if (ch === '"' && converted[i - 1] !== "\\") inString = !inString;
    if (!inString && /\s/.test(ch)) continue;
    result += ch;
  }
  return result;
};

export function outputsMatch(actual: string, expected: string): boolean {
  const a = normalizeOutput(actual);
  const e = normalizeOutput(expected);
  if (a === e) return true;
  // A string answer printed without quotes: bab vs "bab"
  if (e.length >= 2 && e.startsWith('"') && e.endsWith('"') && a === e.slice(1, -1)) return true;
  // Numbers printed with a different number of decimals
  const an = Number(a);
  const en = Number(e);
  return a !== "" && e !== "" && !Number.isNaN(an) && !Number.isNaN(en) && Math.abs(an - en) < 1e-5;
}

// Code drafts are kept per problem and language, so nothing is lost when leaving the page
const draftKey = (problemId: string, language: string) => `prodify-draft:${problemId}:${language}`;

export function loadDraft(problemId: string, language: string): string | null {
  try {
    return localStorage.getItem(draftKey(problemId, language));
  } catch {
    return null;
  }
}

export function saveDraft(problemId: string, language: string, code: string) {
  try {
    localStorage.setItem(draftKey(problemId, language), code);
  } catch {
    // Storage full or blocked: the code still works, it just isn't remembered
  }
}

export function clearDraft(problemId: string, language: string) {
  try {
    localStorage.removeItem(draftKey(problemId, language));
  } catch {
    // Nothing to clear
  }
}

// The language to open problems in: the one used last, else the one picked in Settings
export function preferredLanguage(): string {
  const supported = SUPPORTED_LANGUAGES.map((l) => l.value);
  for (const key of ["prodify-last-language", "prodify-preferred-language"]) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      if (supported.includes(value)) return value;
    } catch {
      // Ignore unreadable values
    }
  }
  return "python";
}

export function rememberLanguage(language: string) {
  try {
    localStorage.setItem("prodify-last-language", JSON.stringify(language));
  } catch {
    // Not remembered; harmless
  }
}
