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

### Running the Application

```bash
docker-compose up
```

This will start both the simulation API and my solution. The API will be accessible at:

- Simulation API: http://localhost:3000
- My API: http://localhost:3001

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

# Run tests with coverage
npm run test:coverage
```

## Implementation Details

- The application polls the simulation API every 1000ms to fetch the latest state
- Mappings are fetched and applied to convert IDs to human-readable names
- Events that are no longer returned by the simulation API are marked as REMOVED
- REMOVED events are maintained in the application state but not exposed via the API
- Property changes (score, status) are logged with old and new values
- Error handling is implemented to manage cases where mappings can't be resolved

## Design Decisions

1. **In-memory Storage**: As per requirements, the application state is stored in memory. No external database is used.
2. **Minimalistic Dependencies**: The solution uses minimal external dependencies, mainly Express.js for HTTP handling.
3. **Clean Code**: The code is structured to be readable and maintainable, with clear separation of concerns.
4. **Error Handling**: Comprehensive error handling is implemented to ensure robustness.
5. **Logging**: Changes to sport events are logged as required.

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
