const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`

let currentContainer: HTMLElement | null = null

let inlineCodeState = false
let codeBlockState = false
let backtickBuffer = ""
let currentCodeElement: HTMLElement | null = null

// Do not edit this method
function runStream() {
  currentContainer = document.getElementById("markdownContainer")!

  // Reset state
  inlineCodeState = false
  codeBlockState = false
  backtickBuffer = ""
  currentCodeElement = null
  currentContainer.innerHTML = ""

  // this randomly split the markdown into tokens between 2 and 20 characters long
  // simulates the behavior of an ml model thats giving you weirdly chunked tokens
  const tokens: string[] = []
  let remainingMarkdown = blogpostMarkdown
  while (remainingMarkdown.length > 0) {
    const tokenLength = Math.floor(Math.random() * 18) + 2
    const token = remainingMarkdown.slice(0, tokenLength)
    tokens.push(token)
    remainingMarkdown = remainingMarkdown.slice(tokenLength)
  }

  const toCancel = setInterval(() => {
    const token = tokens.shift()
    if (token) {
      addToken(token)
    } else {
      clearInterval(toCancel)
    }
  }, 20)
}

function addToken(token: string) {
  if (!currentContainer) return

  let i = 0
  while (i < token.length) {
    const char = token[i]
    backtickBuffer += char

    // Check for triple backticks - must check before single backticks
    if (backtickBuffer.endsWith("```")) {
      // Flush everything before the triple backticks
      const beforeTriple = backtickBuffer.slice(0, -3)
      if (beforeTriple) {
        addTextToElement(beforeTriple)
      }

      // Toggle code block state
      codeBlockState = !codeBlockState
      inlineCodeState = false // Exit inline code if in code block

      // Create/close code block element
      if (codeBlockState) {
        currentCodeElement = document.createElement("code")
        currentCodeElement.style.backgroundColor = "#282c34"
        currentCodeElement.style.color = "#abb2bf"
        currentCodeElement.style.padding = "15px"
        currentCodeElement.style.borderRadius = "6px"
        currentCodeElement.style.fontFamily = "monospace"
        currentCodeElement.style.display = "block"
        currentCodeElement.style.whiteSpace = "pre-wrap"
        currentCodeElement.style.margin = "10px 0"
        currentContainer.appendChild(currentCodeElement)
      } else {
        currentCodeElement = null
      }

      backtickBuffer = ""
    }
    // Check for single backtick (only if not potentially part of triple backticks)
    else if (backtickBuffer.endsWith("`") && !backtickBuffer.endsWith("``") && !codeBlockState) {
      // Flush everything before the backtick
      const beforeBacktick = backtickBuffer.slice(0, -1)
      if (beforeBacktick) {
        addTextToElement(beforeBacktick)
      }

      // Toggle inline code state
      inlineCodeState = !inlineCodeState

      // Create/close inline code element
      if (inlineCodeState) {
        currentCodeElement = document.createElement("code")
        currentCodeElement.style.backgroundColor = "#f0f0f0"
        currentCodeElement.style.color = "#d73a49"
        currentCodeElement.style.padding = "2px 6px"
        currentCodeElement.style.borderRadius = "3px"
        currentCodeElement.style.fontFamily = "monospace"
        currentCodeElement.style.fontSize = "0.95em"
        currentContainer.appendChild(currentCodeElement)
      } else {
        currentCodeElement = null
      }

      backtickBuffer = ""
    }
    // If we have 3+ characters and none are backticks, flush all but last 2
    else if (backtickBuffer.length >= 3 && !backtickBuffer.includes("`")) {
      const toFlush = backtickBuffer.slice(0, -2)
      addTextToElement(toFlush)
      backtickBuffer = backtickBuffer.slice(-2)
    }

    i++
  }

  // At token end, flush buffer if it's definitely not a backtick sequence
  if (backtickBuffer.length >= 2 && !backtickBuffer.includes("`")) {
    const toFlush = backtickBuffer.slice(0, -1)
    addTextToElement(toFlush)
    backtickBuffer = backtickBuffer.slice(-1)
  }
}

function addTextToElement(text: string) {
  if (!currentContainer || !text) return

  if ((codeBlockState || inlineCodeState) && currentCodeElement) {
    // Add to current code element
    currentCodeElement.appendChild(document.createTextNode(text))
  } else {
    // Add as regular text in a span
    const span = document.createElement("span")
    span.appendChild(document.createTextNode(text))
    currentContainer.appendChild(span)
  }
}
