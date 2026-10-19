# 🤝 Contributing to TaskFlow

Thank you for your interest in contributing to **TaskFlow**! We welcome and appreciate contributions of all kinds: bug fixes, new features, UI/UX polish, performance enhancements, and documentation updates.

Please take a moment to review this guide before getting started.

---

## 🧭 Table of Contents
1. [Code of Conduct](#-code-of-conduct)
2. [How Can I Contribute?](#-how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Features](#suggesting-features)
   - [Submitting Pull Requests](#submitting-pull-requests)
3. [Development Setup](#-development-setup)
4. [Branching & Commit Guidelines](#-branching--commit-guidelines)
5. [Code Style & Best Practices](#-code-style--best-practices)
6. [Submitting Your PR](#-submitting-your-pr)

---

## 📜 Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and kind in all discussions, issues, and pull requests.

---

## 💡 How Can I Contribute?

### Reporting Bugs
If you encounter a bug or unexpected behavior:
1. Check the [existing issues](https://github.com) to make sure it hasn't already been reported.
2. If it is new, open an issue using the **🐛 Bug Report** template.
3. Provide step-by-step instructions to reproduce the issue, your browser/device info, and console errors or screenshots where applicable.

### Suggesting Features
Have an idea to make TaskFlow even better?
1. Check existing issues and discussions to avoid duplicate suggestions.
2. Open an issue using the **✨ Feature Request** template.
3. Clearly explain what problem it solves, how it should look and behave, and any alternatives you've thought about.

### Submitting Pull Requests
1. Search open issues to see if someone is already working on the feature or fix.
2. If working on a new feature or substantial change, open an issue first to discuss the design with maintainers before writing code.
3. Pick up issues labeled `good first issue` or `help wanted` if you are new to the codebase!

---

## 🛠️ Development Setup

TaskFlow is designed to be lightweight, modern, and dependency-free (pure HTML5, CSS3, and modern Vanilla JavaScript).

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/TODO_List.git
   cd TODO_List
   ```
3. **Run locally**:
   - Simply open [index.html](file:///c:/Users/Kundan%20Kumar/Desktop/TODO_List/index.html) in your favorite browser.
   - Or run a local HTTP server:
     ```bash
     # Using Python:
     python -m http.server 3000

     # Or using Node:
     npx serve .
     ```
4. Access `http://localhost:3000` to interact with TaskFlow.

---

## 🌿 Branching & Commit Guidelines

### Branch Naming
Create a feature branch from `main`:
- `feat/add-reminder-notifications`
- `fix/subtask-delete-bug`
- `style/card-glassmorphism-contrast`
- `docs/update-readme`

```bash
git checkout -b feat/your-feature-name
```

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) convention:
- `feat: add task drag-and-drop sorting`
- `fix: resolve theme toggle flicker on initial load`
- `style: refine button hover glow effects`
- `docs: clarify contributor installation steps`
- `refactor: modularize task filter handlers in app.js`

---

## 🎨 Code Style & Best Practices

- **Vanilla Stack**: Avoid introducing heavy external libraries unless explicitly approved.
- **Modern JavaScript**: Use ES6+ syntax (`const`/`let`, arrow functions, template literals, optional chaining).
- **Clean Styling**: Keep CSS organized in [style.css](file:///c:/Users/Kundan%20Kumar/Desktop/TODO_List/style.css) using CSS variables and modern layout techniques (Flexbox, Grid).
- **Accessibility (a11y)**: Use semantic HTML tags, accessible form labels, keyboard navigation, and proper ARIA attributes.
- **Theme Support**: Ensure all visual changes look great in both **Dark Mode** and **Light Mode**.
- **Mobile Responsive**: Test changes across desktop, tablet, and mobile screen widths (320px+).

---

## 🚀 Submitting Your PR

1. Ensure your local branch is up to date with the latest upstream `main`.
2. Test thoroughly on desktop and mobile viewports.
3. Check the developer console to confirm there are zero warnings or errors.
4. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
5. Open a Pull Request against the `main` branch.
6. Fill out all sections of the [Pull Request Template](.github/pull_request_template.md).
7. Attach before/after screenshots or GIFs for any UI changes.

---

🎉 **Thank you for making TaskFlow better for everyone!**
