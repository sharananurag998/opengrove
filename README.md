# OpenGrove

An open-source creator commerce platform that empowers digital creators to sell their work directly to their audience with 0% platform fees.

## 🚀 Features

### Core Platform Features
- **0% Platform Fees** - Keep 100% of your revenue (only pay payment processor fees)
- **Unlimited Customization** - Full control over your storefront appearance and functionality
- **True Data Ownership** - Export all your data anytime, no lock-in
- **Multiple Product Types** - Digital downloads, subscriptions, physical goods, and bundles
- **Built-in Marketing Tools** - Affiliate system, discount codes, email automation
- **Developer Friendly** - API-first architecture with webhook support

### Creator Dashboard
- **Product Management** - Create and manage digital products with version control
- **File Upload System** - Secure file storage with MinIO integration
- **Analytics Dashboard** - Track sales, revenue, and customer insights
- **Customer Management** - View and manage your customer base
- **Payout Management** - Track earnings and payment history

### Customer Experience
- **Modern Storefront** - Beautiful, responsive product pages
- **Shopping Cart** - Persistent cart with local storage
- **Secure Checkout** - Stripe integration with multiple payment methods
- **Digital Delivery** - Automatic file delivery with download management
- **Customer Dashboard** - Order history and download management

### Security & Compliance
- **Secure File Storage** - S3-compatible storage with MinIO
- **Download Protection** - Time-limited, tracked download links
- **License Key Generation** - Automatic license keys for software products
- **PCI Compliance** - Secure payment processing through Stripe
- **GDPR Ready** - Data export and deletion capabilities

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe (PayPal coming soon)
- **File Storage**: MinIO (S3-compatible)
- **Email**: Nodemailer with React Email
- **Styling**: Tailwind CSS
- **Deployment**: Docker & Kubernetes ready

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn
- Stripe account (for payments)

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

4. Configure your environment variables:
   - Add your Stripe API keys
   - Set up database connection
   - Configure MinIO settings

5. Start the development services:
```bash
npm run docker:up
```

6. Run database migrations:
```bash
npm run db:push
```

7. Seed the database (optional):
```bash
npm run db:seed
```

8. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

### Default Credentials (Development)

After running the seed script, you can login with:

- **Admin**: admin@opengrove.local / admin123
- **Creator**: creator@opengrove.local / creator123
- **Customer**: customer@opengrove.local / customer123

## 📁 Project Structure

```
opengrove/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages (admin, creator, customer)
│   │   ├── products/        # Public product pages
│   │   └── checkout/        # Checkout flow
│   ├── components/          # React components
│   │   ├── cart/           # Shopping cart components
│   │   ├── checkout/       # Checkout components
│   │   ├── product/        # Product display components
│   │   └── ui/             # Shared UI components
│   ├── contexts/           # React contexts (cart, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core libraries
│   │   ├── auth/          # Authentication logic
│   │   ├── db/            # Database client
│   │   ├── email/         # Email services
│   │   ├── services/      # External services (Stripe, MinIO)
│   │   └── utils/         # Utility functions
│   ├── types/              # TypeScript types
│   └── generated/          # Generated files (Prisma client)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seeder
├── public/                 # Static assets
├── docs/                   # Documentation
└── docker-compose.yml      # Docker services
```

## 🧪 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/opengrove"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CURRENCY="usd"  # or "inr" for Indian accounts

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="opengrove"

# Email
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@opengrove.local"
```

### Stripe Configuration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Configure webhook to listen for `checkout.session.completed` events

For Indian Stripe accounts:
- Use INR currency
- Ensure you're registered as a business (not individual)
- Use international test cards for testing

## 🚢 Deployment

### Using Docker

1. Build the Docker image:
```bash
docker build -t opengrove .
```

2. Run with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Notes

- **Production**: Use proper SSL certificates and secure environment variables
- **Staging**: Enable Stripe test mode
- **Development**: Use local MinIO and MailHog for testing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

OpenGrove is open source software licensed under the [MIT License](LICENSE).

## 🆘 Support

- **Documentation**: [docs.opengrove.dev](https://docs.opengrove.dev)
- **Community**: [Discord](https://discord.gg/opengrove)
- **Issues**: [GitHub Issues](https://github.com/yourusername/opengrove/issues)
- **Email**: support@opengrove.dev

## 🎯 Roadmap

See [PROGRESS.md](PROGRESS.md) for detailed development progress and upcoming features.

### Current Focus
- Payment gateway integrations (PayPal, Razorpay)
- Advanced analytics dashboard
- Multi-language support
- Mobile app development

### Future Plans
- Marketplace features
- AI-powered recommendations
- Blockchain integration for NFTs
- Advanced creator tools

## 🙏 Acknowledgments

- Built with ❤️ by the OpenGrove community
- Powered by amazing open-source projects
- Special thanks to all contributors

---

**Ready to start selling?** Deploy OpenGrove today and join the creator economy revolution! 🚀