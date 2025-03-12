# ActionScribe

ActionScribe is an AI-powered note-taking application that automatically extracts actionable items from your notes. Built with Next.js, it uses OpenAI's GPT API to intelligently identify and track tasks within your text.

## Features

- 📝 **Smart Note Taking**: Write your notes naturally in a clean, distraction-free interface
- 🤖 **AI-Powered Action Extraction**: Automatically identifies tasks and action items from your notes
- ✅ **Task Management**: Track and mark tasks as complete
- 🔒 **Secure Authentication**: Google Sign-in integration
- 💾 **Persistent Storage**: All your notes and actions are saved to your account

## Example

Turn this note:
```
Had a meeting with the design team today. Need to update the color palette
by next week. Sarah mentioned we should schedule a user testing session
for the new features. Also, don't forget to send the project timeline
to stakeholders by Friday.
```

Into these actionable items:
```
✅ Update color palette (Due: Next week)
✅ Schedule user testing session for new features
✅ Send project timeline to stakeholders (Due: Friday)
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/actionscribe.git
cd actionscribe
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables by copying the example file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
- Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com)
- Set up Google OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
- Generate a NextAuth secret: `openssl rand -base64 32`
- Set up your PostgreSQL database and configure the connection URL

5. Initialize the database:
```bash
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Tech Stack

- **Frontend**: Next.js 14, React, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google Provider
- **AI**: OpenAI GPT API
- **Styling**: Tailwind CSS

## Environment Variables

```env
NEXT_PUBLIC_OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_API_KEY="your-openai-api-key"
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/actionscribe"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
