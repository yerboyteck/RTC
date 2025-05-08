# RTC Test Solution

This repository contains my solution for the Real-time Crawlers interview task. The application fetches sport events data from the simulation API and exposes it via a RESTful endpoint.

## Architecture

The application follows a clean architecture approach with:

- Models defining the domain objects
- Services implementing business logic
- Controllers handling HTTP requests
- Utils containing helper functions

## How to Run

### Prerequisites

- Docker >= 23.0.5
- Docker Compose >= 2.24.6
- Node.js >= 20.x (for local development)

### Running the Application

#### Using Docker

```bash
docker-compose up
```

This will start both the simulation API and my solution. The API will be accessible at:

- Simulation API: http://localhost:3000
- My API: http://localhost:3001

#### Local Development

1. Copy the `.env.example` file to create a new `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Make sure the simulation API is running on localhost:3000

3. Install dependencies and start the application:
   ```bash
   npm install
   npm start
   ```

### Environment Configuration

The application uses the following environment variables:

- `PORT`: The port on which the API will run (default: 3001)
- `SIMULATION_HOST`: Hostname for the simulation API (default: localhost)
- `SIMULATION_PORT`: Port for the simulation API (default: 3000)

These are automatically configured in Docker using the docker-compose.yml file.

### API Endpoints

- `GET /client/state` - Returns the current state of the application without removed events
- `GET /health` - Health check endpoint

## Testing

The application is tested using Vitest. To run the tests:

```bash
# First, install dependencies
npm install

# Run tests once
npm test

# Run tests with watch mode
npm run test:watch
```

## Implementation Details

- The application polls the simulation API every 1000ms to fetch the latest state
- Mappings are fetched and applied to convert IDs to human-readable names
- Events that are no longer returned by the simulation API are marked as REMOVED
- REMOVED events are maintained in the application state but not exposed via the API
- Property changes (score, status) are logged with old and new values
- Error handling is implemented to manage cases where mappings can't be resolved
- Cross-environment compatibility between Docker and local development

## Design Decisions

1. **In-memory Storage**: As per requirements, the application state is stored in memory. No external database is used.

2. **Minimalistic Dependencies**: The solution uses minimal external dependencies, with Express.js as the primary framework for HTTP handling. Express was chosen because:

   - It provides a lightweight, unopinionated framework that aligns with the minimal dependencies requirement
   - It offers built-in middleware for common HTTP tasks without bloat
   - Its widespread adoption ensures reliability and maintainability
   - The performance overhead is negligible compared to building a custom HTTP server
   - It abstracts away low-level details while still giving full control over the implementation

3. **Clean Code**: The code is structured to be readable and maintainable, with clear separation of concerns.

4. **Error Handling**: Comprehensive error handling is implemented to ensure robustness.

5. **Logging**: Changes to sport events are logged as required.

6. **Environment Flexibility**: The application can run both in Docker containers and directly on the local machine with the same codebase.

7. **Configuration via Environment Variables**: Using environment variables allows for easy configuration across different environments without code changes.

## TDD Approach

The implementation was built following a Test-Driven Development approach:

1. Write failing tests for the requirements
2. Implement the necessary code to make the tests pass
3. Refactor the code while ensuring tests still pass

The tests are organized to verify each component independently:

- Utility functions (parsers, mappers)
- Services (event and simulation services)
- Controllers
- Application setup

## Troubleshooting

If you encounter connection issues between containers:

- Ensure the simulation service is running and accessible
- Check that the environment variables are correctly set
- For Docker deployments, verify that containers are on the same network
- For local development, ensure the simulation API is running on the expected host and port
