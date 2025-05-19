# Contributing to OpenGrove

First off, thank you for considering contributing to OpenGrove! It's people like you that make OpenGrove such a great tool for the creator economy. 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@opengrove.dev](mailto:conduct@opengrove.dev).

### Our Standards

- **Be Respectful**: Value each other's ideas, styles, and viewpoints
- **Be Direct but Professional**: We can be honest while being respectful
- **Be Inclusive**: Seek diverse perspectives and be welcoming to all
- **Be Collaborative**: Better solutions come from working together
- **Be Pragmatic**: Balance idealism with practical constraints

## 🚀 Getting Started

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page
2. **Clone Your Fork**: 
   ```bash
   git clone https://github.com/YOUR-USERNAME/opengrove.git
   cd opengrove
   ```
3. **Add Upstream Remote**:
   ```bash
   git remote add upstream https://github.com/opengrove/opengrove.git
   ```
4. **Keep Your Fork Updated**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear Title**: Summarize the issue in a few words
- **Description**: Detailed description of the bug
- **Steps to Reproduce**: List the steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots
- **Environment**: OS, browser, Node.js version, etc.
- **Additional Context**: Any other relevant information

**Template**:
```markdown
### Bug Description
A clear and concise description of the bug.

### Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
What you expected to happen.

### Actual Behavior
What actually happened.

### Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 20.10.0]
- npm: [e.g., 10.2.3]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear Title**: Summarize the enhancement
- **Detailed Description**: Explain the enhancement and why it would be useful
- **Use Cases**: Provide examples of how it would be used
- **Possible Implementation**: If you have ideas on how to implement it
- **Alternatives**: Any alternative solutions you've considered

### Your First Code Contribution

Unsure where to begin? Look for these labels:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements or additions to documentation
- `bug` - Confirmed bugs that need fixing
- `enhancement` - New features or improvements

## 💻 Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Git
- A code editor (we recommend VS Code)
- A Stripe account for payment testing

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Up Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Docker Services**:
   ```bash
   npm run docker:up
   ```

4. **Set Up Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Run Tests**:
   ```bash
   npm run test
   npm run test:watch  # For watch mode
   ```

### Useful Commands

```bash
# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run typecheck     # Run TypeScript checks
npm run format        # Format code with Prettier

# Database
npm run db:studio     # Open Prisma Studio
npm run db:push       # Push schema changes
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database

# Docker
npm run docker:up     # Start services
npm run docker:down   # Stop services
npm run docker:logs   # View logs
npm run docker:reset  # Reset everything

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📁 Project Structure

```
opengrove/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core libraries and utilities
│   ├── types/            # TypeScript type definitions
│   └── generated/        # Generated files (don't edit)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
├── public/               # Static assets
├── tests/                # Test files
└── docs/                 # Documentation
```

### Key Directories

- **`src/app/api/`**: API routes
- **`src/lib/services/`**: External service integrations
- **`src/components/ui/`**: Reusable UI components
- **`src/lib/auth/`**: Authentication logic

## 📐 Development Guidelines

### General Principles

1. **Keep It Simple**: Prefer simple, readable code over clever solutions
2. **Think in Components**: Break down complex UIs into smaller components
3. **Type Everything**: Use TypeScript types for all data structures
4. **Handle Errors**: Always handle errors gracefully
5. **Consider Performance**: Think about performance implications
6. **Write Tests**: Add tests for new features and bug fixes

### Code Organization

- **One component per file**: Each React component should have its own file
- **Co-locate related code**: Keep related files close together
- **Use barrel exports**: Export from index files for cleaner imports
- **Separate concerns**: Business logic, UI logic, and data fetching should be separate

### State Management

- **Local state first**: Use React state for component-specific state
- **Context for shared state**: Use React Context for cross-component state
- **Server state**: Use React Query or SWR for server state
- **Avoid prop drilling**: Use context or composition to avoid deep prop passing

### API Design

- **RESTful conventions**: Follow REST conventions for API routes
- **Consistent responses**: Use consistent response formats
- **Error handling**: Return appropriate HTTP status codes
- **Validation**: Validate all inputs using Zod
- **Documentation**: Document all API endpoints

## 🔄 Pull Request Process

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**:
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Test additions or changes
   - `chore:` Maintenance tasks

4. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template
   - Link related issues

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript checks pass (`npm run typecheck`)
- [ ] Documentation is updated
- [ ] PR description clearly explains changes
- [ ] Related issues are linked
- [ ] Screenshots included for UI changes

### PR Review Process

1. **Automated Checks**: CI will run tests, linting, and type checking
2. **Code Review**: At least one maintainer will review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, a maintainer will merge your PR
5. **Celebration**: Your contribution is now part of OpenGrove! 🎉

## 🎨 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Prefer `const` over `let`
- Use arrow functions for anonymous functions
- Use template literals for string concatenation
- Destructure objects and arrays when possible
- Avoid `any` type - use `unknown` or specific types

```typescript
// Good
const processOrder = async (orderId: string): Promise<Order> => {
  const order = await getOrder(orderId);
  return order;
};

// Bad
function processOrder(orderId) {
  let order = getOrder(orderId);
  return order;
}
```

### React

- Use functional components with hooks
- Use meaningful component names
- Keep components small and focused
- Extract custom hooks for reusable logic
- Use proper TypeScript types for props

```tsx
// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

### CSS/Tailwind

- Use Tailwind CSS utilities
- Create custom components for repeated patterns
- Use CSS modules for component-specific styles
- Follow mobile-first responsive design
- Use CSS variables for theme values

### File Naming

- React components: PascalCase (e.g., `ProductCard.tsx`)
- Utilities/helpers: camelCase (e.g., `formatCurrency.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- Test files: Same name with `.test.ts` suffix

## 🧪 Testing Guidelines

### What to Test

- **Components**: User interactions, rendering, props
- **API Routes**: Request/response, error handling
- **Utilities**: Edge cases, error conditions
- **Hooks**: State changes, side effects

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });

  describe('when condition is true', () => {
    it('should behave this way', () => {
      // Test implementation
    });
  });
});
```

### Testing Best Practices

- Write descriptive test names
- Test behavior, not implementation
- Use data-testid for test selectors
- Mock external dependencies
- Keep tests independent
- Aim for high coverage but focus on critical paths

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions and complex logic
- Document component props with TypeScript interfaces
- Include examples in comments when helpful
- Keep comments up-to-date with code changes

```typescript
/**
 * Calculates the total price including tax and discounts
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param discount - Optional discount amount
 * @returns Total price rounded to 2 decimal places
 * @example
 * calculateTotal(items, 0.08, 10) // Returns 98.64
 */
export const calculateTotal = (
  items: CartItem[],
  taxRate: number,
  discount: number = 0
): number => {
  // Implementation
};
```

### README Updates

Update README.md when you:
- Add new features
- Change setup procedures
- Add new dependencies
- Change configuration options

### API Documentation

Document new API endpoints in the code:

```typescript
/**
 * @route POST /api/products
 * @description Create a new product
 * @access Private - Creator only
 * @body {CreateProductDTO} Product data
 * @returns {Product} Created product
 */
```

## 🌟 Community

### Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/opengrove)
- **GitHub Discussions**: Ask questions and share ideas
- **Issue Tracker**: Report bugs and request features
- **Email**: [support@opengrove.dev](mailto:support@opengrove.dev)

### Stay Updated

- **Blog**: [blog.opengrove.dev](https://blog.opengrove.dev)
- **Twitter**: [@OpenGrove](https://twitter.com/opengrove)
- **Newsletter**: Subscribe on our website

### Recognition

We believe in recognizing our contributors:

- Contributors are listed in our README
- Significant contributors get mention in release notes
- Top contributors receive special Discord roles
- Annual contributor awards

## 🎯 Areas Needing Help

Current priority areas where we need help:

1. **Testing**: Increase test coverage
2. **Documentation**: Improve user guides and API docs
3. **Internationalization**: Add support for more languages
4. **Accessibility**: Improve keyboard navigation and screen reader support
5. **Performance**: Optimize bundle size and loading times
6. **Security**: Security audits and improvements

## 📞 Questions?

Don't hesitate to ask questions! We're here to help:

- Open a [GitHub Discussion](https://github.com/opengrove/opengrove/discussions)
- Ask in our [Discord](https://discord.gg/opengrove)
- Email us at [contributors@opengrove.dev](mailto:contributors@opengrove.dev)

---

Thank you for contributing to OpenGrove! Your efforts help democratize commerce for creators worldwide. 🚀

**Happy coding!** 💻✨