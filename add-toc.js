const fs = require("fs");

function addTableOfContents(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Headline2 추출
    const headline2Regex = /^## (.+)$/gm;
    const headline2Matches = [...content.matchAll(headline2Regex)];

    // 마크다운 목차 생성
    const toc = headline2Matches
      .map(
        (match) =>
          `- [${match[1]}](#${match[1]
            .replace(/ /g, "-")
            .replace(/[()]/g, "")})`
      )
      .join("\n");

    const tocHeader = `### 목차\n\n${toc}\n\n<br />\n\n`;
    const updatedContent = content.replace(
      /^(# .+?)\n\n/s,
      `$1\n\n${tocHeader}`
    );

    fs.writeFileSync(filePath, updatedContent, "utf-8");

    console.log("Table of Contents added successfully!");
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// filePath 인자로 전달(e.g., node add-toc.js ./README.md)
const filePath = process.argv[2];
if (!filePath) {
  console.error("Please provide the file path as an argument.");
  process.exit(1);
}

addTableOfContents(filePath);
