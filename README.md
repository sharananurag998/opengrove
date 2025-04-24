# OpenGrove

An open-source creator commerce platform that empowers digital creators to sell their work directly to their audience with 0% platform fees.

## Features

- **0% Platform Fees** - Keep 100% of your revenue (only pay payment processor fees)
- **Unlimited Customization** - Full control over your storefront appearance and functionality
- **True Data Ownership** - Export all your data anytime, no lock-in
- **Multiple Product Types** - Digital downloads, subscriptions, physical goods, and bundles
- **Built-in Marketing Tools** - Affiliate system, discount codes, email automation
- **Developer Friendly** - API-first architecture with webhook support

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe & PayPal
- **File Storage**: MinIO (S3-compatible)
- **Email**: Nodemailer with React Email
- **Styling**: Tailwind CSS
- **Deployment**: Docker & Kubernetes ready

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/opengrove.git
cd opengrove
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start the development services:
```bash
npm run docker:up
```

5. Run database migrations:
```bash
npm run db:push
```

6. Seed the database (optional):
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

### Default Credentials (Development)

After running the seed script, you can login with:

- **Admin**: admin@opengrove.local / admin123
- **Creator**: creator@opengrove.local / creator123
- **Customer**: customer@opengrove.local / customer123

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

## Project Structure

```
opengrove/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Core libraries
│   │   ├── auth/         # Authentication
│   │   ├── db/           # Database client
│   │   ├── email/        # Email services
│   │   ├── payments/     # Payment integrations
│   │   └── storage/      # File storage
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
├── public/               # Static assets
└── docker-compose.yml    # Docker services
```

## Deployment

### Using Docker

1. Build the Docker image:
```bash
docker build -t opengrove .
```

2. Run with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Run database migrations:
```bash
npm run db:migrate deploy
```

3. Start the server:
```bash
npm run start
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

OpenGrove is open source software licensed under the [MIT License](LICENSE).

## Support

- Documentation: [docs.opengrove.dev](https://docs.opengrove.dev)
- Community: [Discord](https://discord.gg/opengrove)
- Issues: [GitHub Issues](https://github.com/yourusername/opengrove/issues)

## Roadmap

### Phase 1: MVP (Current)
- [x] Core authentication system
- [x] Database schema
- [x] Docker development environment
- [x] Basic product creation
- [x] File upload system (MinIO integration)
- [x] Public product pages
- [x] Shopping cart functionality
- [ ] Stripe integration
- [ ] Customer checkout flow
- [ ] File delivery system

### Phase 2: Creator Empowerment
- [ ] Storefront customization
- [ ] Custom domains
- [ ] Product versions
- [ ] Discount codes
- [ ] Customer management

### Phase 3: Growth & Community
- [ ] Affiliate system
- [ ] Email automation
- [ ] Analytics dashboard
- [ ] Subscription products
- [ ] Physical products

### Phase 4: Platform Ecosystem
- [ ] Plugin architecture
- [ ] Theme marketplace
- [ ] OpenGrove Cloud
- [ ] Enterprise features