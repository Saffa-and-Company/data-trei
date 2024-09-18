# Data Trei

Data Trei is an advanced B2B log tracking and threat intelligence platform built with Next.js, Supabase, and various cloud integrations. It provides real-time monitoring, AI-powered analysis, and seamless integration with GitHub and Google Cloud Platform (GCP).

## Technical Stack

- **Frontend**: Next.js 14.2.7 with React 18
- **Backend**: Serverless functions (Next.js API routes)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **UI Framework**: Radix UI
- **Styling**: Tailwind CSS
- **API Integrations**: GitHub API, Google Cloud Platform API
- **AI Integration**: Google Gemini AI

## Key Features

1. **GitHub Integration**
   - OAuth2 authentication with GitHub
   - Repository tracking and webhook integration
   - Collaborator management
   - Real-time log ingestion from GitHub events

2. **GCP Integration**
   - OAuth2 authentication with Google Cloud Platform
   - Project selection and log ingestion setup
   - Real-time log streaming from GCP projects

3. **Custom Log Ingestion**
   - RESTful API endpoint for custom log ingestion
   - API key authentication for secure log submission

4. **AI-Powered Log Analysis**
   - Integration with Google's Gemini AI for natural language log querying
   - Support for analyzing GitHub, GCP, and custom logs

5. **Real-time Updates**
   - Supabase real-time subscriptions for live log updates

6. **Multi-tenant Architecture**
   - User-specific data isolation and access control

## Project Structure

- `src/app`: Next.js app router structure
  - `api`: Serverless API routes
  - `dashboard`: Main application dashboard
  - `github-connections`: GitHub integration management
  - `gcp-integration`: GCP integration management
  - `api-keys`: API key management for custom log ingestion
- `src/components`: Reusable React components
- `src/utils`: Utility functions and helpers
- `src/types`: TypeScript type definitions, including Supabase database types

## Key Components

1. **GithubIntegration**: Manages GitHub OAuth flow, repository selection, and webhook setup.
2. **GCPIntegration**: Handles GCP OAuth flow, project selection, and log ingestion configuration.
3. **TrackedRepos**: Displays and manages tracked GitHub repositories.
4. **GeminiLogAnalysis**: Integrates with Google's Gemini AI for natural language log querying.

## API Routes

- `/api/github/*`: Endpoints for GitHub integration (auth, webhooks, collaborators)
- `/api/gcp/*`: Endpoints for GCP integration (auth, projects, logs)
- `/api/webhook/log`: Custom log ingestion endpoint
- `/api/gemini/analyze-logs`: AI-powered log analysis endpoint

## Database Schema

The Supabase database includes tables for:
- Users
- GitHub connections
- GCP connections
- Tracked repositories
- GitHub logs
- GCP logs
- Custom logs
- API keys

## Authentication and Security

- Supabase handles user authentication and session management.
- GitHub and GCP integrations use OAuth2 for secure access token management.
- Custom log ingestion is secured with API keys, stored and validated against the database.
- All sensitive operations are protected with server-side checks for user authentication and authorization.

## Real-time Functionality

- Supabase real-time subscriptions are used for live updates of logs and tracked repositories.
- WebSocket connections are established for each relevant table to push updates to the client.

## AI Integration

- Google's Gemini AI is integrated for natural language processing of log queries.
- The integration allows users to ask questions about their logs in plain English, with the AI interpreting and executing the query against the log data.

## Deployment

The application is designed to be deployed on Vercel, leveraging its integration with Next.js for optimal performance and scalability. Environment variables are used to manage sensitive configuration data.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Supabase, GitHub OAuth, GCP OAuth, Gemini AI)
4. Run the development server: `npm run dev`

## Testing

(Note: Specific testing setup is not visible in the provided code snippets. Consider adding unit tests, integration tests, and end-to-end tests using frameworks like Jest and Cypress.)

## Performance Considerations

- Server-side rendering and static site generation are utilized where appropriate to optimize page load times.
- API routes are designed to be efficient, with appropriate error handling and response caching where possible.
- Real-time subscriptions are used judiciously to balance real-time updates with server load.

## Future Enhancements

1. Implement more granular access controls for team collaboration.
2. Expand AI capabilities for predictive analytics and anomaly detection.
3. Add support for additional cloud platforms and log sources.
4. Implement a more robust error handling and logging system.
5. Develop a mobile application for on-the-go log monitoring.

## Contributing

(Add guidelines for contributing to the project, including coding standards, pull request process, and issue reporting.)

## License

(Specify the license under which the project is released.)